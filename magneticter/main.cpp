#include "pch.h"
#include "config.h"
#include "magnetometer_info.h"

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

startup: // label to jump to, on SIGHUP or startup errors.

    initialize_rx_statistics();
    reset_rx_state();

    // Data retrieved from sensors:
    magnetic_info_t mi; // (def constructo)
    gps_db_info_t   gi; // (def constructo)

    int uart_fd = -1;

    if ( !load_config() )
       {
       cerr << "Problems loading configuration!" << endl;
       sleep(5);
       goto cleanup;
       }

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

    // ---------
    // MAIN LOOP
    // ---------

    do {
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
          append_rx_data(buffer, rx_count);
          }
       else if ( rx_count < 0 && errno != EWOULDBLOCK )
               {
               cerr << "Rx error from device: "
                    << get_comm_device_name()
                    << endl;
               break;
               }

       // Parse magnetometer data from raw buffer.
       // Returned value informs  weather mi has been set in this execution:
       if ( process_rx_data(mi) )
          update_rx_statistics(0, 1); // add data to stats (one frame).

       // Retrieve last received GPS info:
       get_gps_db_info(gi);

       // VALIDATE DATA AND INSERT IT IN DB (AFTER FORK)
       //
       // ...
       //

       // relinquish the processor for better global behavior:
       sleep(0);

       // Log stats every 3s if available mi or gi; every 5 secs otherwise:
       if ( LOG_INFO <= get_log_level() )
          {
          // force rx stats (each 3s) only when valid magneto. data available:
          if ( get_rx_statistics(bps, fps) )
             {
             cout << "last field: (bx, by, bz) = (" << mi.bx_string()
                     << ", " << mi.by_string()
                     << ", " << mi.bz_string() << ")" << endl
                  << "last bat: " << mi.bat1_string() << "V "
                  << "last fluxgate temp: " << mi.sensor_temp_string() << "ºC "
                  << "last system temp: " <<  mi.temp1_string() << "ºC " << endl;
             cout << "last gps time/date: " << asctime(gmtime(&gi.utc_time))
                  << fixed << setprecision(5)
                  << "last gps lat, long, alt: " << gi.latitute << ", "
                                                 << gi.longitude << ", "
                                                 << setprecision(1)
                                                 << gi.altitude << endl;
             cout << fixed << setprecision(2)
                  << "rx stats: " << bps << " bps, " << fps << " fps" << endl << "-------------------\n";
             }
          }

       } while ( !get_exit_condition() );

cleanup: // This point can be reached after a normal execution or directly
         // after configuration loading or UART setup failure.

    // Free resources if allocated.

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

          if ( (gps_d_set & STATUS_SET) && (gps_d_status == STATUS_FIX) )
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
