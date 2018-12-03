#ifndef CONFIG_H_INCLUDED
#define CONFIG_H_INCLUDED

const char * get_comm_device_name();
int32_t      get_sensor_threshold();
int          get_log_level();

bool load_config();

#endif // CONFIG_H_INCLUDED
