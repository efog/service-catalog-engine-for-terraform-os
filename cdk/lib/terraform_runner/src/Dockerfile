FROM public.ecr.aws/lambda/python:3.11 as terraform_installer

ARG terraform_version=1.5.7 

WORKDIR /usr/src/terraform

# Download and install Terraform
RUN yum install wget unzip -y

RUN wget -O terraform_${terraform_version}_linux_amd64.zip https://releases.hashicorp.com/terraform/${terraform_version}/terraform_${terraform_version}_linux_amd64.zip

RUN unzip terraform_${terraform_version}_linux_amd64.zip

RUN mv terraform /usr/bin

FROM public.ecr.aws/lambda/python:3.11

WORKDIR /usr/src/app

# Install Wheel
RUN pip3 install wheel

# Copy files
COPY . .

# Run tests
RUN python3 -m unittest

# Run setup
RUN python3 setup.py bdist_wheel

# Install
RUN pip3 install dist/terraform_runner-0.1-py3-none-any.whl

ENTRYPOINT ["python3", "-m", "terraform_runner"]

# Set the CMD to your handler (could also be done as a parameter override outside of the Dockerfile)
CMD [  ]