####################
# BUILD BASE IMAGE #
####################
FROM python:3.10-slim AS base

RUN mkdir -p /etc/apt/keyrings

RUN apt update && apt install -y ca-certificates curl gnupg 

RUN curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg

ENV NODE_MAJOR=16

RUN echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list

RUN apt remove cmdtest && curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - && echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list && apt update && apt install -y nodejs yarn

RUN groupadd --gid 1000 user \
    && useradd --uid 1000 --gid user --shell /bin/bash --create-home user

###############
# compile tsc #
###############
FROM base AS tsc

WORKDIR /app

RUN yarn global add typescript

COPY --chown=user:user package*.json ./
COPY --chown=user:user yarn.lock ./
RUN yarn

COPY --chown=user:user . .
RUN tsc

###########
# RUN APP #
###########
FROM base

RUN apt install -y ffmpeg xvfb chromium flac

USER user

WORKDIR /app

COPY --chown=user:user ./requirements.txt req.txt

RUN pip install -r req.txt && rm req.txt

COPY --chown=user:user --from=tsc app/node_modules /app/node_modules

COPY --chown=user:user --from=tsc app/dist /app

COPY --chown=user:user ./google_sr.py /app/.

ENTRYPOINT ["xvfb-run", "-a", "node", "src/index.js"]