# project3-lampstack
deploys e-commerce java based web application on docker using dockerfile and docker compose 
1.the source code is of a lamp stack e-commerce java based web application
2. i prepared docker files for tomcat,nginx,mysql
3. prepared a docker compose file for all the docker files and setting up two more services in the compose file only :- memcached and rabbitmq
4. launched the docker conatiner on a ec2 instance ami ubuntu,type t2.small , volume 20gb ssd3 through a terrafrom script
5.docker image build got created succesfully through :- docker compose build command
6.docker conatiners got deployed successfully to the assigned ports through : dcoker compose up -d command 
