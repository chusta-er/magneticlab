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
#include <libgpsmm.h>

using namespace std;

// control global program flux:
static void sig_handler(int signum);
static int  get_exit_condition();
static void reset_exit_condition();

// computes basic statistics about received data:
static void initialize_rx_statistics();
static void update_rx_statistics(size_t new_bytes, size_t new_frames);
static bool get_rx_statistics(double &bps, double &fps, bool force=false);

struct gps_mag_data_t
{
    int i;
};

static bool get_gps_mag_data(gps_mag_data_t &dest);

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

startup: // label to jump to when SIGHUP received.

    initialize_rx_statistics();
    reset_rx_state();
    load_config();

    int uart_fd = open(get_comm_device_name(), O_RDWR | O_NOCTTY | O_NDELAY);
    fcntl(uart_fd, F_SETFL, FNDELAY);

    // Set UART Tx/Rx options:
    struct termios uart_options;
    // -- Get the current options for the port ...
    tcgetattr(uart_fd, &uart_options);
    // -- Set the baud rates to 115200 ...
    cfsetispeed(&uart_options, B115200);
    cfsetospeed(&uart_options, B115200);
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
    tcsetattr(uart_fd, TCSANOW, &uart_options);

    do {
       uint8_t buffer[4096];
       double  bps, fps;

       magnetic_info_t mi;

       ssize_t rx_count = read(uart_fd, buffer, sizeof(buffer));

       if ( rx_count > 0 )
          {
          // Add data to stats (rx_count bytes):
          update_rx_statistics(rx_count, 0);
          append_rx_data(buffer, rx_count);
          }
       else if ( rx_count < 0 && errno != EWOULDBLOCK )
               {
               cerr << "Rx error from device: "
                    << get_comm_device_name()
                    << endl;
               break;
               }

       if ( process_rx_data(mi) )
          {
          // Add data to stats (one frame):
          update_rx_statistics(0, 1);

          // now that we have magnetometer data it's time to get last received GPS data:
          gps_mag_data_t gps_mag_data;
          if ( get_gps_mag_data(gps_mag_data) )
             {
             // we've got valid GPS data -> Let¡s
             }

          if ( LOG_INFO <= get_log_level() )
             if ( get_rx_statistics(bps, fps, true) )
                {
                cout << "last field: (bx, by, bz) = (" << mi.bx_string()
                        << ", " << mi.by_string()
                        << ", " << mi.bz_string() << ")" << endl
                     << "last bat: " << mi.bat1_string() << "V "
                     << "last fluxgate temp: " << mi.sensor_temp_string() << "ºC "
                     << "last system temp: " <<  mi.temp1_string() << "ºC " << endl;
                cout << fixed << setprecision(2)
                     << "stats: " << bps << " bps, " << fps << " fps" << endl;
                }
          }

       // relinquish the processor for better global behavior:
       sleep(0);

       // Log stats if not yet done (if not receiving, for instance)
       if ( LOG_INFO <= get_log_level() )
          if ( get_rx_statistics(bps, fps) )
             {
             cout << fixed << setprecision(2)
                  << "stats: " << bps << " bps, " << fps
                  << " fps; rx_count = " << rx_count << endl;
             }

       } while ( !get_exit_condition() );

    // Cleanup:
    // ...
    close(uart_fd);

    if ( get_exit_condition() == SIGHUP )
       {
       cout << "magneticter: configuration reload.\n";
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

static void reset_exit_condition() {exit_condition = 0;}

static int get_exit_condition() {return exit_condition;}

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
static bool get_rx_statistics(double &bps, double &fps, bool force)
{
    timeval tv;
    gettimeofday(&tv, 0);
    double curr_time = (double)tv.tv_sec + (double)tv.tv_usec / 1.0e6;
    double time = curr_time - rx_time;

    // Show stats at least every 4 seconds:
    if ( time < 3.0 ) return false;
    if ( time < 5.0 && !force ) return false;

    bps = rx_bytes / time;
    fps = rx_frames / time;

    // Update references:
    rx_time = curr_time;
    rx_bytes = 0;
    rx_frames = 0;

    return true;
}

static bool get_gps_mag_data(gps_mag_data_t &dest)
{
    gps_data_t sh_mem_data;

    gpsmm gps_info_handler(GPSD_SHARED_MEMORY, 0);

    if ( 0 < gps_read(&sh_mem_data) )
       {
       // ...
       dest.i = 1;
       return true;
       }

    return false;
}
