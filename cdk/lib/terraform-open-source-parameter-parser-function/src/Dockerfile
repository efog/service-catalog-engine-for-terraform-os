FROM golang:1.20 as build
WORKDIR /usr/src/app
COPY . .
RUN rm -f go.mod && rm -f go.sum
RUN go mod init terraform_open_source_parameter_parser
RUN go env -w GOPROXY=direct
RUN go mod tidy
# Build with optional lambda.norpc tag
RUN GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -tags lambda.norpc -o main
# Copy artifacts to a clean image
FROM public.ecr.aws/lambda/provided:al2
COPY --from=build /usr/src/app/main ./main
ENTRYPOINT [ "./main" ]