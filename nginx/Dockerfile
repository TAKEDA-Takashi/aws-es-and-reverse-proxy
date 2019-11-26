FROM nginx

COPY default.conf.template /etc/nginx/conf.d/

CMD [ "/bin/sh", "-c", "envsubst '$$SCHEMA$$ENDPOINT' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'" ]
