#include "pch.h"
#include "config.h"

#include <syslog.h>

 // --> /dev/ttyUSBx (/dev/ttyUSB0)
static const char *comm_device_name = "/dev/serial/by-path/platform-3f980000.usb-usb-0:1.3:1.0-port0";

const char * get_comm_device_name() {return comm_device_name;}

int32_t get_sensor_threshold()
{
    return 30000000;
}

int get_log_level()
{
    return LOG_INFO;
}

bool load_config()
{
    return true;
}
