FROM golang:1.21 AS go-builder
WORKDIR /usr
RUN apt update && apt install curl -y  
RUN sh -c "$(curl --location https://taskfile.dev/install.sh)" -- -d

WORKDIR /usr/app

EXPOSE 8000
COPY ./entrypoint.sh ./entrypoint.sh
RUN ["chmod", "+x", "./entrypoint.sh"]
RUN chmod +x ./entrypoint.sh
CMD ["sh", "entrypoint.sh"]
# CMD ["ls"]
# FROM alpine:latest AS go-runner

# WORKDIR /app

# # Copy only the necessary files from the previous stage
# COPY --from=go-builder /app/server .

# # Expose the port your application listens on
# ENV ISENGARD_PORT = 8080
# RUN chmod +x ./server
# Command to run your application
# CMD ["./server"]
