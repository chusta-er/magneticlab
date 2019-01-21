#include "pch.h"
#include "dbsave.h"
#include "config.h"

#include <postgresql/libpq-fe.h>
#include <syslog.h>

using namespace std;

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

    int b_mean = 0,
        b_median = 0,
        b_median_x = 0,
        b_median_y = 0,
        b_median_z = 0,
        b_min = 0,
        b_min_x = 0,
        b_min_y = 0,
        b_min_z = 0,
        b_max = 0,
        b_max_x = 0,
        b_max_y = 0,
        b_max_z = 0,
        b_x_mean = 0,
        b_x_median = 0,
        b_x_max = 0,
        b_x_min = 0,
        b_y_mean = 0,
        b_y_median = 0,
        b_y_max = 0,
        b_y_min = 0,
        b_z_mean = 0,
        b_z_median = 0,
        b_z_max = 0,
        b_z_min = 0;

    short sens_temp_min = 1,
          sens_temp_max = 1,
          sens_temp_med = 1,
          bat_min = 1,
          bat_max = 1,
          bat_med = 1,
          sys_temp_min = 1,
          sys_temp_max = 1,
          sys_temp_med = 1;

    string cmd =
    "START TRANSACTION; SELECT insert_full_register('" +
    uuid_string + "'," +
    to_string( raw_monot_time.tv_sec ) + "," +
    to_string( raw_monot_time.tv_nsec ) + "," +
    to_string( curr_time.tv_sec ) + "," +
    to_string( curr_time.tv_usec ) + "," +
    to_string( mi_c.size() ) + "," +
    to_string( b_mean ) + "," +
    to_string( b_median ) + "," +
    to_string( b_median_x ) + "," +
    to_string( b_median_y ) + "," +
    to_string( b_median_z ) + "," +
    to_string( b_min ) + "," +
    to_string( b_min_x ) + "," +
    to_string( b_min_y ) + "," +
    to_string( b_min_z ) + "," +
    to_string( b_max ) + "," +
    to_string( b_max_x ) + "," +
    to_string( b_max_y ) + "," +
    to_string( b_max_z ) + "," +
    to_string( b_x_mean ) + "," +
    to_string( b_x_median ) + "," +
    to_string( b_x_max ) + "," +
    to_string( b_x_min ) + "," +
    to_string( b_y_mean ) + "," +
    to_string( b_y_median ) + "," +
    to_string( b_y_max ) + "," +
    to_string( b_y_min ) + "," +
    to_string( b_z_mean ) + "," +
    to_string( b_z_median ) + "," +
    to_string( b_z_max ) + "," +
    to_string( b_z_min ) + "," +
    to_string( sens_temp_min ) + "::int2," +
    to_string( sens_temp_max ) + "::int2," +
    to_string( sens_temp_med ) + "::int2," +
    to_string( bat_min ) + "::int2," +
    to_string( bat_max ) + "::int2," +
    to_string( bat_med ) + "::int2," +
    to_string( sys_temp_min ) + "::int2," +
    to_string( sys_temp_max ) + "::int2," +
    to_string( sys_temp_med ) + "::int2" +
    ");COMMIT;";

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
