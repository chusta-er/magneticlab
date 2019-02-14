#include "pch.h"
#include "config.h"

#include <syslog.h>
#include <fstream>
#include <string.h>

using namespace std;

 // --> /dev/ttyUSBx (/dev/ttyUSB0)
static char comm_device_name[128] = "/dev/serial/by-path/platform-3f980000.usb-usb-0:1.3:1.0-port0";
static int  sensor_threshold = 30000000;
static int  sample_period = 15;
static int  log_level = LOG_INFO;

const char * get_comm_device_name() {return comm_device_name;}
int32_t get_sensor_threshold() {return sensor_threshold;}
int get_sample_period() {return sample_period;}
int get_log_level() {return log_level;}

bool load_config()
{
   ifstream is_file("/etc/magneticter/magneticter.conf");
   string   line;

   if ( LOG_NOTICE <= get_log_level() )
      {
      cout << "Loading configuration ...\n";
      if ( is_file.is_open() ) cout << "Configuration file opened.\n";
      else cout << "Could not open configuration file.\n";
      }

   while ( getline(is_file, line) )
         {
         istringstream is_line(line);
         string key;
         if ( getline(is_line, key, '=') )
            {
            string value;
            if ( getline(is_line, value) )
               {
               if ( key == "MAGNETIC_INFO_COM_DEVICE" ) strncpy(comm_device_name, value.c_str(), 127);
               else if ( key == "MAGNETIC_SENSOR_THRESHOLD" ) sensor_threshold = stoi(value);
                    else if ( key == "SAMPLING_PERIOD" ) sample_period = stoi(value);
                         else if ( key == "LOG_LEVEL" ) log_level = stoi(value);
               }
            }
         }

   if ( LOG_NOTICE <= get_log_level() )
      {
      cout << "-> comm_device_name: " << comm_device_name << endl
           << "-> sensor_threshold: " << sensor_threshold << endl
           << "-> sample_period (min): " << sample_period << endl
           << "-> log_level: " << log_level << endl
           << "Configuration end.\n";
      }

   return true;
}
