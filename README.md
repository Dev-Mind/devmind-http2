# HTTP2

![Dev-Mind](https://www.dev-mind.fr/img/logo/logo_1500.png)


## DB setup

Install a version of MySQL > 5.x. After this step connect you as root 
```
mysql -u root -p
```

You can create the schema and a user
```
CREATE DATABASE performance;
CREATE USER 'devmind'@'localhost' IDENTIFIED BY 'devmind';
GRANT ALL on performance.* TO 'devmind'@'localhost'
```
