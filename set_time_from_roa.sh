#! /bin/bash
date -s "@$(expr $(wget -O- -q http://www2.roa.es/cgi-bin/horautc) \/ 1000 2> /dev/null)"
