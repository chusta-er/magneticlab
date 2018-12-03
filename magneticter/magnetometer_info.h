#ifndef MAGNETOMETER_INFO_H_INCLUDED
#define MAGNETOMETER_INFO_H_INCLUDED

#include <string>

struct magnetic_info_t
{
    int32_t bx, by, bz;
    int16_t sensor_temp;
    uint8_t bat1;
    int16_t temp1;

    // flags to indicate that bat1 and temp1 are not valid in the beginning of the capture session.
    static bool    bat_valid;
    static bool    temp_valid;
    static uint8_t bat_prev;
    static int16_t temp_prev;

    magnetic_info_t(int32_t bx, int32_t by, int32_t bz, int16_t sensor_temp)
    : bx(bx), by(by), bz(bz),
      sensor_temp(sensor_temp), bat1(bat_prev), temp1(temp_prev) {}

    magnetic_info_t()
    : bx(0), by(0), bz(0), sensor_temp(0),
      bat1(bat_prev), temp1(temp_prev) {}
    // --------------
    // Type handlers:
    // --------------

    const std::string sensor_temp_string() const
    {char buff[64]; sprintf(buff, "%.1f", (double)sensor_temp / 10); return std::string(buff);}

    const std::string bx_string() const
    {char buff[64]; sprintf(buff, "%.3f", (double)bx / 1000); return std::string(buff);}
    const std::string by_string() const
    {char buff[64]; sprintf(buff, "%.3f", (double)by / 1000); return std::string(buff);}
    const std::string bz_string() const
    {char buff[64]; sprintf(buff, "%.3f", (double)bz / 1000); return std::string(buff);}

    const std::string bat1_string() const
    {char buff[64]; sprintf(buff, "%.1f", (double)bat1  / 10); return std::string(buff);}

    const std::string temp1_string() const
    {char buff[64]; sprintf(buff, "%.1f", (double)temp1 / 10); return std::string(buff);}
};

// Append data to rx state machine buffer:
void append_rx_data(const uint8_t data[], ssize_t data_len);

// Data processing after being received. This functions is called in the rx process:
bool process_rx_data(magnetic_info_t &r );
// Initializes the reception state-machine:
void reset_rx_state();

#endif // MAGNETOMETER_INFO_H_INCLUDED
