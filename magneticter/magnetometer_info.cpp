#include "pch.h"
#include "config.h"
#include "magnetometer_info.h"

#include <vector>
#include <limits.h>
#include <algorithm>
#include <syslog.h>

using namespace std;

static vector<uint8_t> rx_data_buff;
static enum {wait_header, wait_synch, wait_reminder} rx_state;

// Implementation of file_rx_data_register_t static members:
bool    magnetic_info_t::bat_valid;
bool    magnetic_info_t::temp_valid;
uint8_t magnetic_info_t::bat_prev;
int16_t magnetic_info_t::temp_prev;

void reset_rx_state()
{
    rx_data_buff.clear();
    rx_state = wait_header;

    magnetic_info_t::bat_valid  = false;
    magnetic_info_t::temp_valid = false;
    magnetic_info_t::bat_prev   = 0;
    magnetic_info_t::temp_prev  = SHRT_MIN;
}

// -------------------------------
// Data as structured by protocol:
// 4820-MAGMA-SPE-002-INTA-2018
// -------------------------------

struct proto_data
{
    // --------------
    // Type data:
    // --------------

    // DATA
    uint8_t  length;
    uint8_t  msgid;

    union {
          struct {
                 uint32_t utc;
                 int16_t  roll,
                          pitch,
                          yaw;
                 int32_t  lattitude,
                          longitude,
                          altitude;
                 int16_t  sensor_temp;
                 int32_t  bx,
                          by,
                          bz;
                 } mag;   // msgid == 0x80; length == 37;

          uint8_t  bat1;  // msgid == 0x82; length == 2;

          int16_t  temp1; // msgid == 0x83; length == 3;

          }  payload;

private:
    uint8_t byte( int32_t data, uint8_t byte_num )  {return uint8_t((data >> 8 * byte_num) & 0xFF);}
    uint8_t byte( uint32_t data, uint8_t byte_num ) {return byte(int32_t(data), byte_num);}
    uint8_t byte( int16_t data, uint8_t byte_num )  {return uint8_t((data >> 8 * byte_num) & 0xFF);}

    // Base constructor for Tx.
    proto_data(uint8_t length_, uint8_t msgid_) : length(length_), msgid(msgid_) {}

public:
    typedef enum {MAG1, MAG2} mag_type;

    // Constructor for MAG1 & MAG2 data:
    proto_data(mag_type type,
               uint32_t utc,
               int16_t roll, int16_t pitch, int16_t yaw,
               int32_t lattitude, int32_t longitude, int32_t altitude,
               int16_t sensor_temp,
               int32_t bx, int32_t by, int32_t bz)
        : proto_data(37, (type == MAG1) ? 0x80 : 0x81)
    {
        payload.mag.utc = utc;
        payload.mag.roll = roll; payload.mag.pitch = pitch; payload.mag.yaw = yaw;
        payload.mag.lattitude = lattitude; payload.mag.longitude = longitude; payload.mag.altitude = altitude;
        payload.mag.sensor_temp = sensor_temp;
        payload.mag.bx = bx; payload.mag.by = by; payload.mag.bz = bz;
    }

    // Constructor for BAT1 data:
    proto_data(uint8_t bat1) : proto_data(2, 0x82) {payload.bat1 = bat1;}

    // Constructor for TEMP1 data:
    proto_data(int16_t temp1) : proto_data(3, 0x83) {payload.temp1 = temp1;}

    // Deserializer constructor for Rx:
    proto_data( const vector<uint8_t> &serial_input )
    {
        length = serial_input[2];
        msgid  = serial_input[3];

        switch ( msgid )
               {
               case 0x80:
               case 0x81:
                    payload.mag.utc = (uint32_t(serial_input[4]) << 24) | (uint32_t(serial_input[5]) << 16) |
                                      (uint32_t(serial_input[6]) << 8)  |  uint32_t(serial_input[7]);

                    payload.mag.roll  = (int16_t(serial_input[ 8]) << 8) | int16_t(serial_input[ 9]);
                    payload.mag.pitch = (int16_t(serial_input[10]) << 8) | int16_t(serial_input[11]);
                    payload.mag.yaw   = (int16_t(serial_input[12]) << 8) | int16_t(serial_input[13]);

                    payload.mag.lattitude = (int32_t(serial_input[14]) << 24) | (int32_t(serial_input[15]) << 16) |
                                            (int32_t(serial_input[16]) << 8)  |  int32_t(serial_input[17]);
                    payload.mag.longitude = (int32_t(serial_input[18]) << 24) | (int32_t(serial_input[19]) << 16) |
                                            (int32_t(serial_input[20]) << 8)  |  int32_t(serial_input[21]);
                    payload.mag.altitude  = (int32_t(serial_input[22]) << 24) | (int32_t(serial_input[23]) << 16) |
                                            (int32_t(serial_input[24]) << 8)  |  int32_t(serial_input[25]);

                    payload.mag.sensor_temp = (int16_t(serial_input[26]) << 8) | int16_t(serial_input[27]);

                    payload.mag.bx = (int32_t(serial_input[28]) << 24) | (int32_t(serial_input[29]) << 16) |
                                     (int32_t(serial_input[30]) << 8)  |  int32_t(serial_input[31]);
                    payload.mag.by = (int32_t(serial_input[32]) << 24) | (int32_t(serial_input[33]) << 16) |
                                     (int32_t(serial_input[34]) << 8)  |  int32_t(serial_input[35]);
                    payload.mag.bz = (int32_t(serial_input[36]) << 24) | (int32_t(serial_input[37]) << 16) |
                                     (int32_t(serial_input[38]) << 8)  |  int32_t(serial_input[39]);
                    break;

               case 0x82:
                    // bat1
                    payload.bat1 = serial_input[4];
                    break;

               case 0x83:
                    // temp1
                    payload.temp1 = (int16_t(serial_input[4]) << 8) | int16_t(serial_input[5]);
                    break;
               }
    }
};

// To log bytes when packet is ill-formed:
static void log_data_as_bytes(const char *fmt, const uint8_t data[], size_t data_len)
{
    if ( LOG_DEBUG > get_log_level() ) return;

    char out[4096];
    int  out_c = sprintf(out, fmt, data_len);
    for ( size_t i = 0; i < data_len && out_c < int(sizeof(out) - 4); i++ )
        out_c += sprintf(out + out_c, "%02x ", data[i]);
    sprintf(out + out_c, "\n");
    cout << out;
}

// Looks for 0xff in rx_data_buff from offset, data previous to the first 0xff is
// discarded and logged. Indicates that parsing should continue if 0xff is found
// and any bytes remain in buffer:
static bool find_and_log_and_discard( size_t offset )
{
    bool should_continue = false;

    auto ff_pos = find(rx_data_buff.begin() + offset, rx_data_buff.end(), 0xff);

    if ( ff_pos != rx_data_buff.end() )
       // 0xff found ==> caller should continue loop:
       should_continue = true;

    if ( ff_pos != rx_data_buff.begin() )
       {
       // Discard data previous to 0xFF:
       uint8_t bytes[1024];
       size_t  len = ff_pos - rx_data_buff.begin();
       if ( len > sizeof(bytes) ) len = len > sizeof(bytes);

       copy(rx_data_buff.begin(), rx_data_buff.begin() + len, bytes);
       // Unsynchronized data or noise. We can only log it:
       log_data_as_bytes("Unsynch Rx (%d) ", bytes, len);

       rx_data_buff.erase(rx_data_buff.begin(), ff_pos);
       }

    return should_continue;
}

// Append data to rx state machine buffer:
void append_rx_data(const uint8_t data[], ssize_t data_len)
{
    // Append incoming data to container:
    rx_data_buff.insert(rx_data_buff.end(), data, data + data_len);
}

static bool process_rx_msg( const proto_data& rx_msg, magnetic_info_t &r);

// Packet parser state machine:
bool process_rx_data(magnetic_info_t &r)
{
    bool return_value = false;
    static uint8_t msg_len = 0;

    bool continue_loop;

    do {
       continue_loop = false;

       switch ( rx_state )
              {
              case wait_header:
                   continue_loop = find_and_log_and_discard(0);
                   if ( continue_loop ) rx_state = wait_synch;
                   break;

              case wait_synch:
                   if ( rx_data_buff.size() < 2 ) break;
                   if ( rx_data_buff[1] != 0xAA )
                      {
                      continue_loop = find_and_log_and_discard(1);
                      if ( continue_loop ) rx_state = wait_header;
                      break;
                      }
                   if ( rx_data_buff.size() < 4 ) break;

                   // Validate length/msgid
                   if ( !(rx_data_buff[2] == 37 && rx_data_buff[3] == 0x80) &&
                        !(rx_data_buff[2] == 37 && rx_data_buff[3] == 0x81) &&
                        !(rx_data_buff[2] == 2  && rx_data_buff[3] == 0x82) &&
                        !(rx_data_buff[2] == 3  && rx_data_buff[3] == 0x83) )
                      {
                      continue_loop = find_and_log_and_discard(1);
                      if ( continue_loop ) rx_state = wait_header;
                      break;
                      }
                   // Length and msgid valid ==> switch to payload reception.
                   msg_len = (2) + (1 + rx_data_buff[2]) + (2); // head_len + data_len + chksum_len
                   continue_loop = true;
                   rx_state = wait_reminder;
                   break;

              case wait_reminder:
                   {
                   if ( rx_data_buff.size() < msg_len ) break;

                   uint16_t checksum = 0,
                            rx_checksum = uint16_t(rx_data_buff[msg_len - 2]) << 8 |
                                          uint16_t(rx_data_buff[msg_len - 1]);

                   // Compute and validate checksum:
                   for ( size_t i = 2; i < size_t(msg_len) - 2; i++ ) checksum += uint16_t(rx_data_buff[i]);
                   if ( checksum != rx_checksum )
                      {
                      continue_loop = find_and_log_and_discard(1);
                      if ( continue_loop ) rx_state = wait_header;
                      break;
                      }
                   }

                   // Message fully received. If it can be parsed indicate this returning true:
                   if ( process_rx_msg(proto_data(rx_data_buff), r) )
                      return_value = true;

                   rx_data_buff.erase(rx_data_buff.begin(), rx_data_buff.begin() + msg_len);
                   rx_state = wait_header;
                   break;
              }

       } while ( continue_loop );

    return return_value;
}

static bool process_rx_msg( const proto_data& rx_msg, magnetic_info_t &r)
{
    switch ( rx_msg.msgid )
           {
           case 0x80:
           case 0x81:
                // Append data for graph control:
                {
                bool discard_sample = false;

                int32_t threshold = get_sensor_threshold();
                int32_t bx = rx_msg.payload.mag.bx,
                        by = rx_msg.payload.mag.by,
                        bz = rx_msg.payload.mag.bz;

                if ( abs(bx) > threshold || abs(by) > threshold || abs(bz) > threshold )
                   {
                   if ( rx_msg.msgid == 0x81 ) discard_sample = true;
                   }
                else if ( rx_msg.msgid == 0x81 ) {bx >>= 1; by >>= 1; bz >>= 1;}

                // Log received information as correctly parsed message:
                if ( LOG_DEBUG <= get_log_level() )
                   cout << "Rx " << (discard_sample ? "DROP" : "ACCEPT")
                        << "(ID=" << (int)rx_msg.msgid << " LEN=" << (int)rx_msg.length << "):" << endl
                        << "\tutc=" << rx_msg.payload.mag.utc <<  endl
                        << "\troll=" << (int)rx_msg.payload.mag.roll
                        << ", pitch=" << (int)rx_msg.payload.mag.pitch
                        << ", yaw=" << (int)rx_msg.payload.mag.yaw <<  endl
                        << "\tlattitude=" << rx_msg.payload.mag.lattitude
                        << ", longitude=" << rx_msg.payload.mag.longitude
                        << ", altitude=" << rx_msg.payload.mag.altitude <<  endl
                        << "\tsensor temp.= " << (int)rx_msg.payload.mag.sensor_temp <<  endl
                        << "\tBx=" << bx << ", By=" << by << ", Bz=" << bz <<  endl;

                if ( discard_sample ) return false;

                // return data for dump:
                r = magnetic_info_t(bx, by, bz, rx_msg.payload.mag.sensor_temp);
                }

                return true;

           case 0x82:
                // Log received information as correctly parsed message:
                if ( LOG_DEBUG <= get_log_level() )
                   cout << "Rx (ID=" << (unsigned)rx_msg.msgid << " LEN="
                        << (unsigned)rx_msg.length << "): bat1="
                        << (unsigned)rx_msg.payload.bat1 << endl;

                // Set data for db dump; Set the the battery level in the last record (and for successive):
                magnetic_info_t::bat_prev = rx_msg.payload.bat1;
                magnetic_info_t::bat_valid = true;

                return false;

           case 0x83:
                // Log received information as correctly parsed message:
                if ( LOG_DEBUG <= get_log_level() )
                   cout << "Rx (ID=" << (unsigned)rx_msg.msgid << " LEN="
                        << (unsigned)rx_msg.length << "): temp1="
                        << rx_msg.payload.temp1 << endl;

                // Set data for db dump; Set the system temperature in the last record (and for successive):
                magnetic_info_t::temp_prev = rx_msg.payload.temp1;
                magnetic_info_t::temp_valid = true;

                return false;
           }

    return false;
}
