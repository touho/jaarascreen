FROM node:slim

ADD . /jaarascreen

WORKDIR /jaarascreen

CMD npm start
