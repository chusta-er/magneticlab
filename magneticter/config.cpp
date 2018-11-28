#include "pch.h"
#include "config.h"

#include <syslog.h>

static const char *comm_device_name = "/dev/ttyUSB0";

const char * get_comm_device_name() {return comm_device_name;}

int32_t get_sensor_threshold()
{
    return 30000000;
}

int get_log_level()
{
    return LOG_INFO;
}

void load_config()
{
}
