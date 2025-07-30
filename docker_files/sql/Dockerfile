FROM mysql:8.0.33
ENV MYSQL_ROOT_PASSWORD="yash"
ENV MYSQL_DATABASE="glowcart"
ADD db_backup.sql docker-entrypoint-initdb.d/db_backup.sql