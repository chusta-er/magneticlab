#include "pch.h"
#include "config.h"
#include "magnetometer_info.h"

#include "candm.h"

#include <unistd.h>   // UNIX standard function definitions
#include <fcntl.h>    // File control definitions
#include <termios.h>  // POSIX terminal control definitions
#include <sys/time.h> // POSIX time definitions
#include <syslog.h>
#include <signal.h>
#include <string.h>
#include <gps.h>
#include <sys/ipc.h>
#include <sys/shm.h>
#include <time.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <math.h>
#include <stddef.h>

using namespace std;

// control global program flux:
static void sig_handler(int signum);
static inline int  get_exit_condition();
static inline void reset_exit_condition();

// computes basic statistics about received data:
static void initialize_rx_statistics();
static void update_rx_statistics(size_t new_bytes, size_t new_frames);
static bool get_rx_statistics(double &bps, double &fps);

struct gps_db_info_t
{
    time_t utc_time;
    float  latitute, longitude, altitude;

    gps_db_info_t() :
    utc_time(0), latitute(0), longitude(0), altitude(0) {}
};

static void get_gps_db_info(gps_db_info_t &gi);

struct chrony_db_info_t
{
    int    stratum;
    time_t ref_time_utc;
    double last_offset;
    double rms_offset;

    chrony_db_info_t() : stratum(0), ref_time_utc(0), last_offset(0), rms_offset(0) {}
};

static bool get_chrony_db_info(int sock_fd, chrony_db_info_t &ci);

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

    // show startup message.
    cout << "magneticter start." << endl;

    int uart_fd = -1,
        sock_fd = -1;

    sockaddr_in sa;
    memset(&sa, 0, sizeof(sa));
    sa.sin_family = AF_INET;
    sa.sin_port = htons(323);
    inet_aton("127.0.0.1", &sa.sin_addr);

startup: // label to jump to, on SIGHUP or startup errors.

    initialize_rx_statistics();
    reset_rx_state();

    // Data to retrieve from sensors:
    magnetic_info_t  mi; // (def constructo)
    gps_db_info_t    gi; // (def constructo)
    chrony_db_info_t ci; // (def constructo)

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
       cerr << "Cannot open UART port (" << get_comm_device_name() << ")!" << endl;
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

    // -- Enable the receiver and set local mode ...
    uart_options.c_cflag |= (CLOCAL | CREAD);
    // -- Set 8N1 mode ...
    uart_options.c_cflag &= ~PARENB;
    uart_options.c_cflag &= ~CSTOPB;
    uart_options.c_cflag &= ~CSIZE;
    uart_options.c_cflag |= CS8;
    // -- (input option) choose Raw Input ...
    uart_options.c_lflag &= ~(ICANON | ECHO | ECHOE | ISIG);
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
       // time alignment to 500 milliseconds. Info lost during this
       // time can be safely ignored:
       //

       timeval curr_time;
       // -- Get current time with microsecond resolution:
       gettimeofday(&curr_time, 0);
       // -- Align time to next half second:
       __suseconds_t wait_usecs = (curr_time.tv_usec >= 500000) ?
                                  (1000000 - curr_time.tv_usec) :
                                  ((500000 - curr_time.tv_usec));

       if ( 0 > usleep(wait_usecs) )
          continue;

       // -- Get current time again, for informational purposes:
       gettimeofday(&curr_time, 0);

       // -----
       // "raw_time" can be used to correct time in samples already stored in
       // database that were taken when system time was not synchronized
       // with GPS subsystem.
       // -----
       timespec raw_monot_time;
       clock_gettime(CLOCK_MONOTONIC_RAW, &raw_monot_time);

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

          rx_size_before = rx_data_pending();
          // Value returned by process_rx_data informs weather mi has been set.
          if ( process_rx_data(mi) )
             {
              // add data to stats (one frame):
             update_rx_statistics(0, 1);
             // ... (append to vector)
             }
          rx_size_after = rx_data_pending();

          } while ( rx_size_after < rx_size_before );

       // Retrieve last received GPS info:
       get_gps_db_info(gi);
       // ... (append to vector IF CHANGED)

       // Retrieve last chrony state:
       if ( !get_chrony_db_info(sock_fd, ci) )
          {
          cerr << "Cannot request/receive data to/from chrony!" << endl;
          sleep(5);
          goto cleanup;
          }
       // ... (append to vector IF CHANGED)

       // WAIT FOR PLANNED TIME (every 15 min), GET STATISTICS FROM DATA,
       // INSERT EVERYTHING IN DB (AFTER FORK), AND CLEANUP DATA VECTORS
       //
       // ...
       //

       // Log stats every 3s if available mi or gi; every 5 secs otherwise:
       if ( LOG_INFO <= get_log_level() )
          {
          // force rx stats (each 3s) only when valid magneto. data available:
          if ( get_rx_statistics(bps, fps) )
             {
             char info_time_buff[1024];

             strftime(info_time_buff, sizeof(info_time_buff), "%F %T", localtime(&curr_time.tv_sec));

             cout << "system time: " << info_time_buff << '.' << setw(6) << setfill('0') << curr_time.tv_usec << endl
                  << "last field: (bx, by, bz) = (" << mi.bx_string()
                     << ", " << mi.by_string()
                     << ", " << mi.bz_string() << ")" << endl
                  << "last bat: " << mi.bat1_string() << "V "
                  << "last fluxgate temp: " << mi.sensor_temp_string() << "ºC "
                  << "last system temp: " <<  mi.temp1_string() << "ºC " << endl
                  << "last gps time/date: " << asctime(gmtime(&gi.utc_time))
                  << fixed << setprecision(5)
                  << "last gps lat, long, alt: " << gi.latitute << ", "
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

       } while ( !get_exit_condition() );

cleanup: // This point can be reached after a normal execution or directly
         // after configuration loading or UART setup failure.

    // Free resources if allocated.

    if ( -1 != sock_fd ) close(sock_fd);
    if ( -1 != uart_fd ) close(uart_fd);

    if ( get_exit_condition() != SIGTERM && get_exit_condition() != SIGINT )
       {
       if ( get_exit_condition() == SIGHUP ) cout << "magneticter: configuration reload.\n";
       reset_exit_condition();
       goto startup;
       }

    cout << "magneticter end.\n";

    return 0;
}

//
// main program global flux:
//

static int exit_condition = 0;

static inline void reset_exit_condition() {exit_condition = 0;}
static inline int get_exit_condition() {return exit_condition;}

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
    if ( shmid != -1 )
       {
       typedef struct {int bookend1; gps_data_t gpsdata; int bookend2;} shmem_t;

       shmem_t *mem = (shmem_t *)shmat(shmid, 0, 0);

       if ( (int)(long)mem != -1 )
          {
          int bookend1, bookend2;

          gps_mask_t gps_d_set;
          int        gps_d_status;
          time_t     fix_time;
          float      fix_altitude, fix_latitude, fix_longitude;

          do {
             bookend1 = mem->bookend1;

             gps_d_set = mem->gpsdata.set;
             gps_d_status = mem->gpsdata.status;
             fix_time  = (time_t)mem->gpsdata.fix.time;
             fix_altitude  = (float)mem->gpsdata.fix.altitude;
             fix_latitude  = (float)mem->gpsdata.fix.latitude;
             fix_longitude = (float)mem->gpsdata.fix.longitude;

             bookend2 = mem->bookend2;

             } while (bookend2 != bookend1);

          if ( (gps_d_set & STATUS_SET) && (gps_d_status == STATUS_FIX) &&
               isnormal(fix_altitude) && isnormal(fix_latitude) && isnormal(fix_longitude) )
             {
             gi.utc_time  = fix_time;
             gi.altitude  = fix_altitude;
             gi.latitute  = fix_latitude;
             gi.longitude = fix_longitude;
             }

          shmdt((const void *)mem);
          }
       }
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

// |||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||| //

//static int max_retries = 2;
//static int initial_timeout = 1000;
//static int proto_version = PROTO_VERSION_NUMBER;

/* This is the core protocol module.  Complete particular fields in
   the outgoing packet, send it, wait for a response, handle retries,
   etc.  Returns a Boolean indicating whether the protocol was
   successful or not.*/

/*
static int
submit_request(CMD_Request *request, CMD_Reply *reply)
{
  int bad_length, bad_sequence, bad_header;
  int select_status;
  int recv_status;
  int read_length;
  int expected_length;
  int command_length;
  int padding_length;
  struct timespec ts_now, ts_start;
  struct timeval tv;
  int n_attempts, new_attempt;
  double timeout;
  fd_set rdfd, wrfd, exfd;

  request->pkt_type = PKT_TYPE_CMD_REQUEST;
  request->res1 = 0;
  request->res2 = 0;
  request->pad1 = 0;
  request->pad2 = 0;

  n_attempts = 0;
  new_attempt = 1;

  do {
    if (new_attempt) {
      new_attempt = 0;

      if (n_attempts > max_retries)
        return 0;

      if (gettimeofday(&tv, NULL))
        return 0;

      UTI_TimevalToTimespec(&tv, &ts_start);

      UTI_GetRandomBytes(&request->sequence, sizeof (request->sequence));
      request->attempt = htons(n_attempts);
      request->version = proto_version;
      command_length = PKL_CommandLength(request);
      padding_length = PKL_CommandPaddingLength(request);
      assert(command_length > 0 && command_length > padding_length);

      n_attempts++;

      // Zero the padding to not send any uninitialized data
      memset(((char *)request) + command_length - padding_length, 0, padding_length);

      if (sock_fd < 0) {
        DEBUG_LOG(LOGF_Client, "No socket to send request");
        return 0;
      }

      if (send(sock_fd, (void *)request, command_length, 0) < 0) {
        DEBUG_LOG(LOGF_Client, "Could not send %d bytes : %s",
                  command_length, strerror(errno));
        return 0;
      }

      DEBUG_LOG(LOGF_Client, "Sent %d bytes", command_length);
    }

    if (gettimeofday(&tv, NULL))
      return 0;

    UTI_TimevalToTimespec(&tv, &ts_now);

    // Check if the clock wasn't stepped back
    if (UTI_CompareTimespecs(&ts_now, &ts_start) < 0)
      ts_start = ts_now;

    timeout = initial_timeout / 1000.0 * (1U << (n_attempts - 1)) -
              UTI_DiffTimespecsToDouble(&ts_now, &ts_start);
    UTI_DoubleToTimeval(timeout, &tv);
    DEBUG_LOG(LOGF_Client, "Timeout %f seconds", timeout);

    FD_ZERO(&rdfd);
    FD_ZERO(&wrfd);
    FD_ZERO(&exfd);

    FD_SET(sock_fd, &rdfd);

    if (quit)
      return 0;

    select_status = select(sock_fd + 1, &rdfd, &wrfd, &exfd, &tv);

    if (select_status < 0) {
      DEBUG_LOG(LOGF_Client, "select failed : %s", strerror(errno));
    } else if (select_status == 0) {
      // Timeout must have elapsed, try a resend?
      new_attempt = 1;
    } else {
      recv_status = recv(sock_fd, (void *)reply, sizeof(CMD_Reply), 0);

      if (recv_status < 0) {
        // If we get connrefused here, it suggests the sendto is
        // going to a dead port
        DEBUG_LOG(LOGF_Client, "Could not receive : %s", strerror(errno));
        new_attempt = 1;
      } else {
        DEBUG_LOG(LOGF_Client, "Received %d bytes", recv_status);

        read_length = recv_status;
        if (read_length >= offsetof(CMD_Reply, data)) {
          expected_length = PKL_ReplyLength(reply);
        } else {
          expected_length = 0;
        }

        bad_length = (read_length < expected_length ||
                      expected_length < offsetof(CMD_Reply, data));

        if (!bad_length) {
          bad_sequence = reply->sequence != request->sequence;
        } else {
          bad_sequence = 0;
        }

        if (bad_length || bad_sequence) {
          continue;
        }

        bad_header = ((reply->version != proto_version &&
                       !(reply->version >= PROTO_VERSION_MISMATCH_COMPAT_CLIENT &&
                         ntohs(reply->status) == STT_BADPKTVERSION)) ||
                      (reply->pkt_type != PKT_TYPE_CMD_REPLY) ||
                      (reply->res1 != 0) ||
                      (reply->res2 != 0) ||
                      (reply->command != request->command));

        if (bad_header) {
          continue;
        }

#if PROTO_VERSION_NUMBER == 6
        // Protocol version 5 is similar to 6 except there is no padding.
           If a version 5 reply with STT_BADPKTVERSION is received,
           switch our version and try again.
        if (proto_version == PROTO_VERSION_NUMBER &&
            reply->version == PROTO_VERSION_NUMBER - 1) {
          proto_version = PROTO_VERSION_NUMBER - 1;
          n_attempts--;
          new_attempt = 1;
          continue;
        }
#else
#error unknown compatibility with PROTO_VERSION - 1
#endif

        // Good packet received, print out results
        DEBUG_LOG(LOGF_Client, "Reply cmd=%d reply=%d stat=%d",
                  ntohs(reply->command), ntohs(reply->reply), ntohs(reply->status));
        break;
      }
    }
  } while (1);

  return 1;
}


static int request_reply(CMD_Request *request, CMD_Reply *reply, int requested_reply, int verbose)
{
  int status;

  while (!submit_request(request, reply)) {
    // Try connecting to other addresses before giving up
    if (open_io())
      continue;
    printf("506 Cannot talk to daemon\n");
    return 0;
  }

  status = ntohs(reply->status);

  if (verbose || status != STT_SUCCESS) {
    switch (status) {
      case STT_SUCCESS:
        printf("200 OK");
        break;
      case STT_ACCESSALLOWED:
        printf("208 Access allowed");
        break;
      case STT_ACCESSDENIED:
        printf("209 Access denied");
        break;
      case STT_FAILED:
        printf("500 Failure");
        break;
      case STT_UNAUTH:
        printf("501 Not authorised");
        break;
      case STT_INVALID:
        printf("502 Invalid command");
        break;
      case STT_NOSUCHSOURCE:
        printf("503 No such source");
        break;
      case STT_INVALIDTS:
        printf("504 Duplicate or stale logon detected");
        break;
      case STT_NOTENABLED:
        printf("505 Facility not enabled in daemon");
        break;
      case STT_BADSUBNET:
        printf("507 Bad subnet");
        break;
      case STT_NOHOSTACCESS:
        printf("510 No command access from this host");
        break;
      case STT_SOURCEALREADYKNOWN:
        printf("511 Source already present");
        break;
      case STT_TOOMANYSOURCES:
        printf("512 Too many sources present");
        break;
      case STT_NORTC:
        printf("513 RTC driver not running");
        break;
      case STT_BADRTCFILE:
        printf("514 Can't write RTC parameters");
        break;
      case STT_INVALIDAF:
        printf("515 Invalid address family");
        break;
      case STT_BADSAMPLE:
        printf("516 Sample index out of range");
        break;
      case STT_BADPKTVERSION:
        printf("517 Protocol version mismatch");
        break;
      case STT_BADPKTLENGTH:
        printf("518 Packet length mismatch");
        break;
      case STT_INACTIVE:
        printf("519 Client logging is not active in the daemon");
        break;
      default:
        printf("520 Got unexpected error from daemon");
    }
    printf("\n");
  }

  if (status != STT_SUCCESS &&
      status != STT_ACCESSALLOWED && status != STT_ACCESSDENIED) {
    return 0;
  }

  if (ntohs(reply->reply) != requested_reply) {
    printf("508 Bad reply from daemon\n");
    return 0;
  }

  return 1;
}
*/
