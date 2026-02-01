#!/bin/bash

function create_user_and_database() {
	local database=$1
	local user=$2
	local password=$3

	echo "Creating user '$user' and database '$database'..."

	psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
	    CREATE USER $user WITH PASSWORD '$password';
	    CREATE DATABASE $database;
	    GRANT ALL PRIVILEGES ON DATABASE $database TO $user;
	    \c $database
	    GRANT ALL ON SCHEMA public TO $user;
EOSQL
}

# ENV variable POSTGRES_MULTIPLE_DATABASES in the format 'db1:user1:pass1,db2:user2:pass2'
if [ -n "$POSTGRES_MULTIPLE_DATABASES" ]; then
	echo "Initializing multiple databases..."

	for db_setup in $(echo $POSTGRES_MULTIPLE_DATABASES | tr ',' ' '); do
		create_user_and_database $(echo $db_setup | tr ':' ' ')
	done
    
	echo "All databases created."
fi