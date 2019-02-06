#include "pch.h"
#include "dbsave.h"
#include "config.h"

#include <postgresql/libpq-fe.h>
#include <syslog.h>
#include <limits.h>
#include <float.h>
#include <cmath>
#include <map>

using namespace std;

// Median extraction from ad-hoc container:
template <typename floating_type>
static size_t get_median(const multimap<floating_type, size_t> &mmap_c, floating_type &median)
{
    size_t median_i = -1;

    auto map_iter = mmap_c.begin();
    for ( size_t i = 0; i < (mmap_c.size() >> 1); i++ ) map_iter++;
    if ( map_iter != mmap_c.end() )
       {
       median_i = map_iter->second;
       median = map_iter->first;
       }

    return median_i;
}

// Function that performs the db insertion prelude:
void put_into_db( const std::string &uuid_string, const timeval &curr_time,
                  const timespec &raw_monot_time, const chrony_db_info_t &ci,
                  const vector<gps_db_info_t> &gi_c, const vector<magnetic_info_t> &mi_c )
{
    PGconn *conn = PQconnectdb("");

    ConnStatusType conn_stat = PQstatus(conn);

    if ( LOG_INFO <= get_log_level() ) // LOG_NOTICE?
       {
       cout << " == db insertion result  ==\n";
       switch ( conn_stat )
              {
              case CONNECTION_BAD:
                   cout  << " == CONNECTION_BAD       ==\n";
                   break;
              case CONNECTION_OK:
                   cout  << " == CONNECTION_OK        ==\n";
                   break;
              default:
                   cout  << " == (unknown state)      ==\n";
              }
       }

    if ( CONNECTION_OK != conn_stat ) {PQfinish(conn); return;}

    // B stats:
    int num_b = mi_c.size(), num_bat = 0, num_sys_temp = 0;
    double b_mean = 0.0, b_std = 0.0,
           b_median = 0.0, b_median_x = 0.0, b_median_y = 0.0, b_median_z = 0.0,
           b_min = DBL_MAX, b_min_x = DBL_MAX, b_min_y = DBL_MAX, b_min_z = DBL_MAX,
           b_max = -DBL_MAX, b_max_x = -DBL_MAX, b_max_y = -DBL_MAX, b_max_z = -DBL_MAX,
           b_x_mean = 0.0, b_x_std = 0.0, b_x_median = 0.0, b_x_max = -DBL_MAX, b_x_min = DBL_MAX,
           b_y_mean = 0.0, b_y_std = 0.0, b_y_median = 0.0, b_y_max = -DBL_MAX, b_y_min = DBL_MAX,
           b_z_mean = 0.0, b_z_std = 0.0, b_z_median = 0.0, b_z_max = -DBL_MAX, b_z_min = DBL_MAX;

    float sens_temp_min = FLT_MAX, sens_temp_max = -FLT_MAX, sens_temp_med = 0.0,
          bat_min = FLT_MAX, bat_max = -FLT_MAX, bat_med = 0.0,
          sys_temp_min = FLT_MAX, sys_temp_max = -FLT_MAX, sys_temp_med = 0.0;

    // Extract B stats:
    multimap<double, size_t> b_map, bx_map, by_map, bz_map;
    multimap<float, size_t> sens_temp_map, bat_map, sys_temp_map;

    for ( size_t i = 0; i < mi_c.size(); i++ )
        {
        auto &mi = mi_c[i];

        bx_map.insert({double(mi.bx), i});
        by_map.insert({double(mi.by), i});
        bz_map.insert({double(mi.bz), i});
        // - accumulate for b_x_mean:
        b_x_mean += double(mi.bx);
        b_x_max = max(b_x_max, double(mi.bx));
        b_x_min = min(b_x_min, double(mi.bx));
        // - accumulate for b_y_mean:
        b_y_mean += double(mi.by);
        b_y_max = max(b_y_max, double(mi.by));
        b_y_min = min(b_y_min, double(mi.by));
        // - accumulate for b_z_mean:
        b_z_mean += double(mi.bz);
        b_z_max = max(b_z_max, double(mi.bz));
        b_z_min = min(b_z_min, double(mi.bz));
        double b = sqrt(double(mi.bx)*double(mi.bx) + double(mi.by)*double(mi.by) + double(mi.bz)*double(mi.bz));
        // - accumulate for b_mean:
        b_mean += b;
        if ( b < b_min ) {b_min = b; b_min_x = mi.bx; b_min_y = mi.by; b_min_z = mi.bz;}
        if ( b > b_max ) {b_max = b; b_max_x = mi.bx; b_max_y = mi.by; b_max_z = mi.bz;}
        b_map.insert({b, i});

        sens_temp_min = min(sens_temp_min, float(mi.sensor_temp));
        sens_temp_max = max(sens_temp_max, float(mi.sensor_temp));
        sens_temp_map.insert({mi.sensor_temp, i});
        if ( mi.bat1 )
           {
           num_bat++;
           bat_min = min(bat_min, float(mi.bat1));
           bat_max = max(bat_max, float(mi.bat1));
           bat_map.insert({float(mi.bat1), i});
           }
        if ( mi.temp1 != SHRT_MIN )
           {
           num_sys_temp++;
           sys_temp_min = min(sys_temp_min, float(mi.temp1));
           sys_temp_max = max(sys_temp_max, float(mi.temp1));
           sys_temp_map.insert({float(mi.temp1), i});
           }
        }
    // - divide for means:
    b_x_mean /= num_b; b_y_mean /= num_b; b_z_mean /= num_b; b_mean /= num_b;

    // - get standard deviations:
    for ( size_t i = 0; i < mi_c.size(); i++ )
        {
        auto &mi = mi_c[i];
        double b = sqrt(double(mi.bx)*double(mi.bx) + double(mi.by)*double(mi.by) + double(mi.bz)*double(mi.bz));

        b_std += (double(b) - b_mean) * (double(b) - b_mean);
        b_x_std += (double(mi.bx) - b_x_mean) * (double(mi.bx) - b_x_mean);
        b_y_std += (double(mi.by) - b_y_mean) * (double(mi.by) - b_y_mean);
        b_z_std += (double(mi.bz) - b_z_mean) * (double(mi.bz) - b_z_mean);
        }
    double denom = double(num_b - 1);
    if ( num_b < 2 ) denom = 1.0;
    b_std = sqrt(b_std / denom);
    b_x_std = sqrt(b_x_std / denom);
    b_y_std = sqrt(b_y_std / denom);
    b_z_std = sqrt(b_z_std / denom);

    // - extract median for b module
    size_t i = get_median(b_map, b_median);
    if ( i != (size_t)-1 )
       {
       b_median_x = double(mi_c[i].bx);
       b_median_y = double(mi_c[i].by);
       b_median_z = double(mi_c[i].bz);
       }

    // - extract median for b_x
    get_median(bx_map, b_x_median);
    // - extract median for b_y
    get_median(by_map, b_y_median);
    // - extract median for b_z
    get_median(bz_map, b_z_median);

    // - extract median for sensor_temp
    get_median(sens_temp_map, sens_temp_med);
    // - extract median for bat
    get_median(bat_map, bat_med);
    // - extract median for sys_temp
    get_median(sys_temp_map, sys_temp_med);

    // gps stats:
    int num_g = gi_c.size(), time_ref_g = 0;
    double latitute_mean = 0.0, latitute_std = 0.0, latitute_med = 0.0,
          latitute_min = 0.0, latitute_max = 0.0,
          longitude_mean = 0.0, longitude_std = 0.0, longitude_med = 0.0,
          longitude_min = 0.0, longitude_max = 0.0,
          altitude_mean = 0.0, altitude_std = 0.0, altitude_med = 0.0,
          altitude_min = 0.0, altitude_max = 0.0;

    string cmd =
    "START TRANSACTION; SELECT insert_full_register('" +

    // execution uuid:
    uuid_string + "'," +
    // timing info:
    to_string( raw_monot_time.tv_sec ) + "," +
    to_string( raw_monot_time.tv_nsec ) + "," +
    to_string( curr_time.tv_sec ) + "," +
    to_string( curr_time.tv_usec ) + "," +
    // magnetic info:
    (num_b != 0 ?
                to_string( num_b ) + "," +
                to_string( b_mean ) + "::float8," +
                to_string( b_std ) + "::float8," +
                to_string( b_median ) + "::float8," +
                to_string( b_median_x ) + "::float8," +
                to_string( b_median_y ) + "::float8," +
                to_string( b_median_z ) + "::float8," +
                to_string( b_min ) + "::float8," +
                to_string( b_min_x ) + "::float8," +
                to_string( b_min_y ) + "::float8," +
                to_string( b_min_z ) + "::float8," +
                to_string( b_max ) + "::float8," +
                to_string( b_max_x ) + "::float8," +
                to_string( b_max_y ) + "::float8," +
                to_string( b_max_z ) + "::float8," +
                to_string( b_x_mean ) + "::float8," +
                to_string( b_x_std ) + "::float8," +
                to_string( b_x_median ) + "::float8," +
                to_string( b_x_max ) + "::float8," +
                to_string( b_x_min ) + "::float8," +
                to_string( b_y_mean ) + "::float8," +
                to_string( b_y_std ) + "::float8," +
                to_string( b_y_median ) + "::float8," +
                to_string( b_y_max ) + "::float8," +
                to_string( b_y_min ) + "::float8," +
                to_string( b_z_mean ) + "::float8," +
                to_string( b_z_std ) + "::float8," +
                to_string( b_z_median ) + "::float8," +
                to_string( b_z_max ) + "::float8," +
                to_string( b_z_min ) + "::float8," +
                to_string( sens_temp_min ) + "::float4," +
                to_string( sens_temp_max ) + "::float4," +
                to_string( sens_temp_med ) + "::float4," +
                (
                (num_bat != 0) ? to_string( bat_min ) + "::float4," +
                                 to_string( bat_max ) + "::float4," +
                                 to_string( bat_med ) + "::float4,"
                               : "NULL, NULL, NULL, "
                ) +
                (
                (num_sys_temp != 0) ? to_string( sys_temp_min ) + "::float4," +
                                      to_string( sys_temp_max ) + "::float4," +
                                      to_string( sys_temp_med ) + "::float4,"
                                    : "NULL, NULL, NULL, "
                )
                :
                string("NULL, NULL, "
                       "NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, "
                       "NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, "
                       "NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, "
                       "NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, "
                       "NULL, NULL, NULL, NULL, NULL, ")
    ) +
    // gps info:
    (num_g != 0 ?
                to_string( time_ref_g ) + "," +
                to_string( num_g ) + "," +
                to_string( latitute_mean ) + "::float8," +
                to_string( latitute_std ) + "::float8," +
                to_string( latitute_med ) + "::float8," +
                to_string( latitute_min ) + "::float8," +
                to_string( latitute_max ) + "::float8," +
                to_string( longitude_mean ) + "::float8," +
                to_string( longitude_std ) + "::float8," +
                to_string( longitude_med ) + "::float8," +
                to_string( longitude_min ) + "::float8," +
                to_string( longitude_max ) + "::float8," +
                to_string( altitude_mean ) + "::float8," +
                to_string( altitude_std ) + "::float8," +
                to_string( altitude_med ) + "::float8," +
                to_string( altitude_min ) + "::float8," +
                to_string( altitude_max ) + "::float8,"
                :
                string("NULL, NULL, "
                       "NULL, NULL, NULL, NULL, "
                       "NULL, NULL, NULL, NULL, "
                       "NULL, NULL, NULL, NULL, "
                       "NULL, NULL, NULL, ")
    ) +
    // chrony info:
    (ci.ref_time_utc != 0 ?
                          to_string( ci.ref_time_utc ) + "," +
                          to_string( ci.stratum ) + "," +
                          to_string( ci.last_offset ) + "::float8," +
                          to_string( ci.rms_offset ) + "::float8"
                          :
                          string("NULL, NULL, NULL, NULL")
    ) +

    ");COMMIT;";

cerr << cmd << endl;

    PGresult *insert_result = PQexec(conn, cmd.c_str());
    ExecStatusType status_insert = PQresultStatus(insert_result);

    if ( LOG_INFO <= get_log_level() ) // LOG_NOTICE?
       {
       switch ( status_insert )
              {
              case PGRES_COMMAND_OK:
                   cout  << " == PGRES_COMMAND_OK     ==\n";
                   break;
              case PGRES_NONFATAL_ERROR:
                   cout  << " == PGRES_NONFATAL_ERROR ==\n";
                   break;
              case PGRES_FATAL_ERROR:
                   cout  << " == PGRES_FATAL_ERROR    ==\n";
                   break;
              default:
                   cout  << " == (unknown insert res) ==\n";
              }
       }

    if ( status_insert != PGRES_COMMAND_OK )
       {
       cerr << PQresStatus(status_insert) << endl;
       char *err_msg = PQresultErrorMessage(insert_result);
       if ( err_msg ) cerr << err_msg << endl;
       }

    // Terminate connection and liberate its resources:
    PQfinish(conn);

    if ( LOG_INFO <= get_log_level() )
       cout << " ==========================\n";
}
