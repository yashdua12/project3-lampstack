FROM maven:3.9.9 AS build_image
RUN git clone https://github.com/yashdua12/project3-lampstack.git
WORKDIR  /project3-lampstack
RUN mvn install

FROM tomcat:10-jdk21-openjdk
RUN rm -rf /usr/local/tomcat/webapps/*
COPY --from=build_image project3-lampstack/target/glowcart.war /usr/local/tomcat/webapps/ROOT.war
EXPOSE 8080
