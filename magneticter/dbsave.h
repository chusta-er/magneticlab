#ifndef DBSAVE_H_INCLUDED
#define DBSAVE_H_INCLUDED

#include "magnetometer_info.h"

#include <uuid/uuid.h>
#include <sys/time.h> // POSIX time definitions

struct gps_db_info_t
{
    time_t utc_time;
    double latitude, longitude, altitude;

    gps_db_info_t() :
    utc_time(0), latitude(0), longitude(0), altitude(0) {}
};

struct chrony_db_info_t
{
    int    stratum;
    time_t ref_time_utc;
    double last_offset;
    double rms_offset;

    void reset() {stratum = 0; ref_time_utc= 0; last_offset = 0; rms_offset = 0;}
    chrony_db_info_t() {reset();}
};

// Function that performs the db insertion prelude:
void put_into_db( const std::string &uuid_string, const timeval &curr_time,
                  const timespec &raw_monot_time, const chrony_db_info_t &ci,
                  const std::vector<gps_db_info_t> &gi_c,
                  const std::vector<magnetic_info_t> &mi_c );

#endif // DBSAVE_H_INCLUDED
