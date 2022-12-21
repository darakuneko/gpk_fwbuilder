FROM debian:bullseye-slim

RUN apt-get update && apt-get install -y locales && localedef -i en_US -c -f UTF-8 -A /usr/share/locale/locale.alias en_US.UTF-8

ENV LANG en_US.utf8

RUN apt-get -y install \
    sudo \
    git \
    python3 \
    python3-pip \
    nodejs\
    npm

RUN python3 -m pip install qmk

RUN echo 'PATH="$HOME/.local/bin:$PATH"' >> $HOME/.bashrc

RUN ["/bin/bash", "-c", "source $HOME/.bashrc"]

RUN qmk setup -y

COPY ./server/ /server

WORKDIR /server

RUN npm install

CMD node ./src/app.js
