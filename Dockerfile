FROM node:current-slim
LABEL maintainer="MTARGET Developer <dev@mtarget.co>"

# See https://crbug.com/795759
# RUN apt-get update && apt-get install -yq libx11-6 libx11-xcb1 libgconf-2-4 libxcomposite1

RUN apt-get update && apt-get install -y \
  apt-utils \
  apt-transport-https \
  ca-certificates \
  gnupg \
  wget \ 
  --no-install-recommends \
  && wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add - \
  && echo "deb https://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list \
  && apt-get update && apt-get install -y \
  google-chrome-stable \
  fontconfig \
  fonts-ipafont-gothic \
  fonts-wqy-zenhei \
  fonts-thai-tlwg \
  fonts-kacst \
  fonts-symbola \
  fonts-noto \
  fonts-freefont-ttf \
  --no-install-recommends \
  && apt-get purge --auto-remove -y gnupg \
  && rm -rf /var/lib/apt/lists/*


# It's a good idea to use dumb-init to help prevent zombie chrome processes.
ADD https://github.com/Yelp/dumb-init/releases/download/v1.2.0/dumb-init_1.2.0_amd64 /usr/local/bin/dumb-init
RUN chmod +x /usr/local/bin/dumb-init

COPY . /app/
#COPY local.conf /etc/fonts/local.conf
WORKDIR app

RUN yarn

# Add Chrome as a user
RUN groupadd -r chrome && useradd -r -g chrome -G audio,video chrome \
	&& mkdir -p /home/chrome && chown -R chrome:chrome /home/chrome \
	&& mkdir -p /opt/google/chrome-beta && chown -R chrome:chrome /opt/google/chrome-beta

# Run Chrome non-privileged
USER chrome

EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]
CMD ["yarn", "start"]