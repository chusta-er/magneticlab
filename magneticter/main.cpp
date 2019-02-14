#include "pch.h"
#include "config.h"
#include "dbsave.h"

#include "candm.h"

#include <unistd.h>   // UNIX standard function definitions
#include <fcntl.h>    // File control definitions
#include <termios.h>  // POSIX terminal control definitions
#include <syslog.h>
#include <signal.h>
#include <string.h>
#include <gps.h>
#include <sys/ipc.h>
#include <sys/shm.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <math.h>
#include <stddef.h>
#include <sys/wait.h>

using namespace std;

// control global program flux:
static void sig_handler(int signum);
static inline int  get_exit_condition();
static inline void set_fork_exit_condition();
static inline void reset_exit_condition();

// computes basic statistics about received data:
static void initialize_rx_statistics();
static void update_rx_statistics(size_t new_bytes, size_t new_frames);
static bool get_rx_statistics(double &bps, double &fps);

static void get_gps_db_info(gps_db_info_t &gi);
static bool get_chrony_db_info(int sock_fd, chrony_db_info_t &ci);

#define FORK_EXIT_CONDITION (_NSIG)

int main()
{
    // configure cout unbuffered. It is the default for cerr:
    cout << unitbuf;

    // Setup termination signals:
    if ( signal(SIGINT, sig_handler)  == SIG_ERR ||
         signal(SIGTERM, sig_handler) == SIG_ERR ||
         signal(SIGHUP, sig_handler)  == SIG_ERR )
       {
       cerr << "Cannot set termination signals!" << endl;
       return (-1);
       }

    // Initialize a session uuid in string type:
    string uuid_string;
    {
    uuid_t uuid;
    char   uuid_chr[37];
    uuid_generate(uuid);
    uuid_unparse(uuid, uuid_chr);
    uuid_string = uuid_chr;
    }


    // show startup message.
    cout << "magneticter start." << endl;

    sockaddr_in sa;
    memset(&sa, 0, sizeof(sa));
    sa.sin_family = AF_INET;
    sa.sin_port = htons(323);
    inet_aton("127.0.0.1", &sa.sin_addr);

startup: // label to jump to, on SIGHUP or startup errors.

    int uart_fd = -1,
        sock_fd = -1;

    initialize_rx_statistics();
    reset_rx_state();

    // Containers for sensor data:
    vector<gps_db_info_t>   gi_c;
    vector<magnetic_info_t> mi_c;

    if ( !load_config() )
       {
       cerr << "Problems loading configuration!" << endl;
       sleep(5);
       goto cleanup;
       }

    // ----------------
    // Initialize UART:
    // ----------------
    uart_fd = open(get_comm_device_name(), O_RDWR | O_NOCTTY | O_NDELAY);

    if ( -1 == uart_fd )
       {
       cerr << "Cannot open UART port (" << get_comm_device_name() << ": "
            << errno << ")!" << endl;
       sleep(5);
       goto cleanup;
       }

    if ( -1 == fcntl(uart_fd, F_SETFL, FNDELAY) )
       {
       cerr << "Cannot configure UART port (fcntl)!" << endl;
       sleep(5);
       goto cleanup;
       }

    // Set UART Tx/Rx options:
    struct termios uart_options;
    // -- Get the current options for the port ...
    if ( -1 == tcgetattr(uart_fd, &uart_options) )
       {
       cerr << "Cannot configure UART port (tcgetattr)!" << endl;
       sleep(5);
       goto cleanup;
       }

    // -- Set the baud rates to 115200 ...
    if ( -1 == cfsetispeed(&uart_options, B115200) )
       {
       cerr << "Cannot configure UART port (cfsetispeed)!" << endl;
       sleep(5);
       goto cleanup;
       }
    if ( -1 == cfsetospeed(&uart_options, B115200) )
       {
       cerr << "Cannot configure UART port (cfsetospeed)!" << endl;
       sleep(5);
       goto cleanup;
       }

    // -- Input modes - clear indicated ones giving: no break, no CR to NL,
    // no parity check, no strip char, no start/stop output (sic) control
    uart_options.c_iflag &= ~(BRKINT | ICRNL | INPCK | ISTRIP | IXON);

    // -- Enable the receiver and set local mode ...
    uart_options.c_cflag |= (CLOCAL | CREAD);
    // -- Set 8N1 mode ...
    uart_options.c_cflag &= ~PARENB;
    uart_options.c_cflag &= ~CSTOPB;
    uart_options.c_cflag &= ~CSIZE;
    uart_options.c_cflag |= CS8;
    // -- (input option) choose Raw Input ...
    uart_options.c_lflag &= ~(ICANON | ECHO | ECHOE | IEXTEN | ISIG);
    // -- (output option) raw output is selected by
    // resetting the OPOST optionin the c_oflag member ...
    uart_options.c_oflag &= ~OPOST;
    // -- Set the new uart_options for the port ...
    if ( -1 == tcsetattr(uart_fd, TCSANOW, &uart_options) )
       {
       cerr << "Cannot configure UART port (cfsetospeed)!" << endl;
       sleep(5);
       goto cleanup;
       }

    // ----------------------------------------------
    // Initialise the socket used to talk to chronyd
    // ----------------------------------------------

    if ( (sock_fd = socket(AF_INET, SOCK_DGRAM, 0)) < 0 )
       {
       cerr << "Cannot create socket to chrony daemon! (" << errno << ")"<< endl;
       sleep(5);
       goto cleanup;
       }

    if ( connect(sock_fd, (const sockaddr *)&sa, sizeof(sa)) < 0 )
       {
       cerr << "Cannot connect to chrony daemon! (" << errno << ")"<< endl;
       sleep(5);
       goto cleanup;
       }

    // ---------
    // MAIN LOOP
    // ---------

    do {

       // Relinquish the processor for better global behavior and
       // real time alignment to 500 milliseconds. Info lost during
       // this time can be safely ignored:
       //

       static timeval last_db_time = {0,0};

       timeval  curr_time;
       timespec raw_monot_time;

       // -- Get current time with microsecond resolution:
       gettimeofday(&curr_time, 0);
       // -- Align time to next global (real) half second:
       __suseconds_t wait_usecs = (curr_time.tv_usec >= 500000) ?
                                  (1000000 - curr_time.tv_usec) :
                                  ((500000 - curr_time.tv_usec));

       // Let system to remove zombie children:
       waitpid(WAIT_ANY, NULL, WNOHANG);

       if ( 0 > usleep(wait_usecs) )
          continue;

       uint8_t buffer[4096];
       double  bps, fps;

       //
       // Get raw magnetometer data from UART:
       //
       ssize_t rx_count = read(uart_fd, buffer, sizeof(buffer));
       if ( -1 == rx_count )
          if ( EAGAIN != errno && EWOULDBLOCK != errno )
             {
             cerr << "Cannot read UART port!" << endl;
             sleep(5);
             goto cleanup;
             }

       if ( rx_count > 0 )
          {
          update_rx_statistics(rx_count, 0); // add data to stats (rx_count bytes).
          rx_data_append(buffer, rx_count);
          }
       else if ( rx_count < 0 && errno != EWOULDBLOCK )
               {
               cerr << "Rx error from device: "
                    << get_comm_device_name()
                    << endl;
               break;
               }

       // Parse magnetometer data from raw buffer. Iterate while there
       // were data left and it could be parsed (previous execution of
       // parser reduces buffer data).
       size_t rx_size_before, rx_size_after;

       do {
          magnetic_info_t mi;

          rx_size_before = rx_data_pending();
          // Value returned by process_rx_data informs weather mi has been set.
          if ( process_rx_data(mi) )
             {
              // add data to stats (one frame):
             update_rx_statistics(0, 1);
             // ... (append to vector)
             mi_c.push_back((const magnetic_info_t &)mi);
             }
          rx_size_after = rx_data_pending();

          } while ( rx_size_after < rx_size_before );

       // Retrieve last received GPS info and append it to vector:
       // (GPS info is not considered critical)

       static gps_db_info_t    gi;    // (def. constructor)
       static chrony_db_info_t ci;    // (def. constructor)
       static chrony_db_info_t ci_db; // (def. constructor)

       // Aux vars to analyze returned data from sensors:
       gps_db_info_t    gi_aux;     // (def. constructor)
       chrony_db_info_t ci_aux; // (def. constructor)

       // Save the gps sample only if it is not zero and newer from previous one:
       get_gps_db_info(gi_aux);
       if ( gi_aux.utc_time && gi_aux.utc_time > gi.utc_time )
          {
          gi_c.push_back((const gps_db_info_t &)gi_aux);
          gi = gi_aux;
          }

       // Retrieve last chrony state:
       if ( !get_chrony_db_info(sock_fd, ci_aux) )
          {
          cerr << "Cannot request/receive data to/from chrony!" << endl;
          sleep(5);
          goto cleanup;
          }
       // Save the chrony sample only if it is not zero and newer from previous one:
       if ( ci_aux.ref_time_utc && ci_aux.stratum == 1 && ci_aux.ref_time_utc > ci.ref_time_utc )
          ci = ci_aux;

       // Get current time again, for timed actions:
       gettimeofday(&curr_time, 0);
       // -- initialize last_db_time
       if ( last_db_time.tv_sec == 0 ) last_db_time = curr_time;

       // -- -----
       // -- "raw time" can be used to correct time in samples already stored in
       // -- database that were taken when system time was not synchronized
       // -- with GPS subsystem.
       // -- -----
       clock_gettime(CLOCK_MONOTONIC_RAW, &raw_monot_time);

       // Show short-term stats:
       if ( LOG_INFO <= get_log_level() )
          {
          // rx stats are generated each 4s:
          if ( get_rx_statistics(bps, fps) )
             {
             char info_time_buff[1024];

             magnetic_info_t mi;
             if ( mi_c.size() ) mi = mi_c.back();

             strftime(info_time_buff, sizeof(info_time_buff), "%F %T", gmtime(&curr_time.tv_sec));

             cout << "UTC time: " << info_time_buff << '.' << setw(6) << setfill('0') << curr_time.tv_usec << endl
                  << "last field: (bx, by, bz) = (" << mi.bx_string()
                     << ", " << mi.by_string()
                     << ", " << mi.bz_string() << ")" << endl
                  << "last bat: " << mi.bat1_string() << "V "
                  << "last fluxgate temp: " << mi.sensor_temp_string() << "ºC "
                  << "last system temp: " <<  mi.temp1_string() << "ºC " << endl
                  << "last gps time/date: " << asctime(gmtime(&gi.utc_time))
                  << fixed << setprecision(5)
                  << "last gps lat, long, alt: " << gi.latitude << ", "
                                                 << gi.longitude << ", "
                                                 << setprecision(1)
                                                 << gi.altitude << endl
                  << "last chrony time ref: " << asctime(gmtime(&ci.ref_time_utc))
                  << "last chrony stratum/offset/rms offset: "
                  << ci.stratum << "/"
                  << fixed << setprecision(7)
                  << ci.last_offset << "/"
                  << ci.rms_offset << endl
                  << setprecision(2)
                  << "rx stats: " << bps << " bps, " << fps << " fps" << endl << "-------------------\n";
             }
          }

       // ---------------------------------------------------------------
       // WAIT FOR PLANNED TIME (every 15 min) and:
       // - GET STATISTICS FROM DATA (IN A FORKED CHILD).
       // - INSERT EVERYTHING IN DB (IN A FORKED CHILD).
       // - CLEANUP DATA VECTORS.
       // - The subprocess terminates setting the exit condition to
       //   FORK_EXIT_CONDITION
       tm *curr_time_tm = gmtime(&curr_time.tv_sec);

       if ( ((curr_time_tm->tm_min % get_sample_period() == 0) &&
             (curr_time_tm->tm_sec == 0) &&
             (curr_time.tv_usec < 500000)) ||
            (curr_time.tv_sec - last_db_time.tv_sec >= (get_sample_period() * 60)) )
          {
          double stat_lap_time = ((double)curr_time.tv_sec + (double)curr_time.tv_usec * 1.e-6) -
                                 ((double)last_db_time.tv_sec + (double)last_db_time.tv_usec * 1.e-6);

          // Prepare chrony info to insert:
          ci_aux.reset();

          if ( ci_db.ref_time_utc < ci.ref_time_utc )
             {
             ci_aux = ci;
             ci_db = ci;
             }

          pid_t pid = fork();
          if ( -1 == pid )
             {
             cerr << "Cannot fork db insertion child process!" << endl;
             sleep(5);
             goto cleanup;
             }

          if ( 0 != pid )
             {
             // Parent process:
             if ( LOG_NOTICE <= get_log_level() )
                {
                char info_time_buff[1024];

                strftime(info_time_buff, sizeof(info_time_buff), "%F %T", curr_time_tm);
                cout << " =====================================\n "
                     << info_time_buff << '.' << setw(6) << setfill('0') << curr_time.tv_usec
                     << " (" << setprecision(7) << stat_lap_time << " secs elapsed)\n"
                     << " Launched DB storage subprocess (pid=" << pid << ")\n"
                     << " B field samples: " << mi_c.size() << "\n"
                     << " GPS samples: " << gi_c.size() << "\n"
                     << " Chrony samples: " << (ci_aux.ref_time_utc ? "1" : "0") << "\n"
                     << " =====================================\n";
                }
             // Reset data:
             mi_c.clear();
             gi_c.clear();

             // Update last fork time:
             last_db_time = curr_time;
             }
          else {
               // --------------
               // Child process:
               // --------------
               put_into_db(uuid_string, curr_time, raw_monot_time, ci_aux, gi_c, mi_c);
               set_fork_exit_condition();
               continue; // just in case ...
               }
          }

       } while ( !get_exit_condition() );

cleanup: // This point can be reached after a normal execution or directly
         // after configuration loading or UART setup failure.

    // Free resources if allocated.

    if ( -1 != sock_fd ) close(sock_fd);
    if ( -1 != uart_fd ) close(uart_fd);

    if ( get_exit_condition() != SIGTERM &&
         get_exit_condition() != SIGINT  &&
         get_exit_condition() != FORK_EXIT_CONDITION )
       {
       if ( get_exit_condition() == SIGHUP ) cout << "magneticter: configuration reload.\n";
       reset_exit_condition();
       goto startup;
       }

    if ( get_exit_condition() != FORK_EXIT_CONDITION )
       cout << "magneticter end.\n";
    else if ( LOG_NOTICE <= get_log_level() )
            cout << "\n == magneticter DB subprocess ends ==\n";

    return 0;
}

//
// main program global flux:
//

static int exit_condition = 0;

static inline void reset_exit_condition() {exit_condition = 0;}
static inline void set_fork_exit_condition() {exit_condition = FORK_EXIT_CONDITION;}
static inline int  get_exit_condition() {return exit_condition;}

static void sig_handler(int signum)
{
    cout << "Detected: " << strsignal(signum) << endl;
    exit_condition = signum;
}

//
// statistics:
//

// For Rx statistics:
static size_t rx_bytes, rx_frames;
static double rx_time;

static void initialize_rx_statistics()
{
    rx_bytes = 0;
    rx_frames = 0;

    timeval tv;
    gettimeofday(&tv, 0);
    rx_time = (double)tv.tv_sec + (double)tv.tv_usec / 1.0e6;
}

static void update_rx_statistics(size_t new_bytes, size_t new_frames)
{
    rx_bytes += new_bytes;
    rx_frames += new_frames;
}

// computes basic statistics about received data:
static bool get_rx_statistics(double &bps, double &fps)
{
    timeval tv;
    gettimeofday(&tv, 0);
    double curr_time = (double)tv.tv_sec + (double)tv.tv_usec / 1.0e6;
    double time = curr_time - rx_time;

    // Show stats at least every 4 seconds:
    if ( time < 4.0 ) return false;

    bps = rx_bytes / time;
    fps = rx_frames / time;

    // Update references:
    rx_time = curr_time;
    rx_bytes = 0;
    rx_frames = 0;

    return true;
}

#define GPSD_KEY ((key_t)0x47505344)

static void get_gps_db_info(gps_db_info_t &gi)
{
    int shmid = shmget(GPSD_KEY, sizeof(gps_data_t), 0666);
    if ( shmid < 0 ) return;

    typedef struct {int bookend1; gps_data_t gpsdata; int bookend2;} shmem_t;

    shmem_t volatile *mem = (shmem_t volatile *)shmat(shmid, 0, 0);

    if ( (long)mem < 0 ) return;

    int bookend1, bookend2;

    //gps_mask_t gps_d_set;
    int    gps_d_status;
    time_t fix_time;
    double fix_altitude, fix_latitude, fix_longitude;

    do {
       bookend1 = mem->bookend1;

       //gps_d_set = mem->gpsdata.set;
       gps_d_status = mem->gpsdata.status;
       fix_time  = (time_t)mem->gpsdata.fix.time;
       fix_altitude  = mem->gpsdata.fix.altitude;
       fix_latitude  = mem->gpsdata.fix.latitude;
       fix_longitude = mem->gpsdata.fix.longitude;

       bookend2 = mem->bookend2;

       } while (bookend2 != bookend1);

    if ( //(gps_d_set & STATUS_SET) &&
         gps_d_status == STATUS_FIX &&
         isnormal(fix_altitude) && isnormal(fix_latitude) && isnormal(fix_longitude) )
       {
       gi.utc_time  = fix_time;
       gi.altitude  = fix_altitude;
       gi.latitude  = fix_latitude;
       gi.longitude = fix_longitude;
       }

    shmdt((const void *)mem);
}

#define FLOAT_EXP_BITS 7
#define FLOAT_COEF_BITS ((int)sizeof (int32_t) * 8 - FLOAT_EXP_BITS)

double FloatNetworkToHost(Float f)
{
    int32_t  exp, coef;
    uint32_t x;

    x = ntohl(f.f);

    exp = x >> FLOAT_COEF_BITS;
    if ( exp >= 1 << (FLOAT_EXP_BITS - 1) ) exp -= 1 << FLOAT_EXP_BITS;
    exp -= FLOAT_COEF_BITS;

    coef = x % (1U << FLOAT_COEF_BITS);
    if ( coef >= 1 << (FLOAT_COEF_BITS - 1) ) coef -= 1 << FLOAT_COEF_BITS;

    return coef * pow(2.0, exp);
}

static bool get_chrony_db_info(int sock_fd, chrony_db_info_t &ci)
{
    static enum {SENDING, RECEIVING} state = SENDING;
    static constexpr int padding_length = (uint16_t)
                                          ((offsetof(CMD_Request, data.null.EOR)) < (offsetof(CMD_Reply, data.tracking.EOR)) ?
                                           (offsetof(CMD_Reply, data.tracking.EOR)) - (offsetof(CMD_Request, data.null.EOR)) : 0);
    static constexpr int command_length = offsetof(CMD_Request, data.null.EOR) + padding_length;
    static double rx_i_time = 0.0;
    static uint32_t sent_seq = 0;

    CMD_Request request;
    CMD_Reply   reply;

    switch ( state )
           {
           case SENDING:
                request.command = htons(REQ_TRACKING);
                request.pkt_type = PKT_TYPE_CMD_REQUEST;
                request.res1 = 0;
                request.res2 = 0;
                request.pad1 = 0;
                request.pad2 = 0;

                sent_seq = request.sequence = time(0);
                request.attempt  = 0;
                request.version  = PROTO_VERSION_NUMBER;

                if ( send(sock_fd, (void *)&request, command_length, 0) == command_length )
                   {
                   state = RECEIVING;
                   timeval tv;
                   gettimeofday(&tv, 0);
                   rx_i_time = (double)tv.tv_sec + (double)tv.tv_usec * 1e-6;
                   }
                else return false;

                break;

           case RECEIVING:
                if ( recv(sock_fd, &reply, sizeof(reply), MSG_DONTWAIT) < 0 )
                   {
                   if ( errno == EAGAIN || errno == EWOULDBLOCK )
                      {
                      timeval tv;
                      gettimeofday(&tv, 0);
                      double rx_e_time = (double)tv.tv_sec + (double)tv.tv_usec * 1e-6;

                      if ( (rx_e_time - rx_i_time) > 2.0 )
                         state = SENDING; // too much time waiting => ask again.

                      break;
                      }
                   else return false;
                   }

                if ( ntohs(reply.reply) == RPY_TRACKING &&
                     ntohs(reply.status) == STT_SUCCESS &&
                     sent_seq == reply.sequence )
                   {
                   ci.stratum = ntohs(reply.data.tracking.stratum);
                   ci.ref_time_utc = ntohl(reply.data.tracking.ref_time.tv_sec_low);
                   ci.last_offset = FloatNetworkToHost(reply.data.tracking.last_offset);
                   ci.rms_offset = FloatNetworkToHost(reply.data.tracking.rms_offset);
                   }

                // Switch state to request data, anyway:
                state = SENDING;

                break;
           }

    return true;
}
