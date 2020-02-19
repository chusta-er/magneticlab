#!/bin/bash

echo "(ga166)" | sudo -S -u postgres psql -c "drop database magneticter;"
echo "(ga166)" | sudo -S -u postgres psql -c "drop user magneticter;"
echo "(ga166)" | sudo -S -u postgres psql -c "drop database magneticlab;"
echo "(ga166)" | sudo -S -u postgres psql -c "drop user magneticlab;"
echo "(ga166)" | sudo -S -u postgres psql -c "drop user \"www-data\";"
echo "(ga166)" | sudo -S -u postgres psql -c "drop user grafana;"
echo "(ga166)" | sudo -S -u postgres psql -f magneticter_c.sql
echo "(ga166)" | sudo -S -u magneticter psql -f magneticter.sql
