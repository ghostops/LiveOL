terraform {
  backend "s3" {
    bucket = "liveol"
    key    = "tf/server.tfstate"
    region = "eu-north-1"
  }
}

provider "aws" {
  version = "~> 2.0"
  region  = "eu-north-1"
}

variable "ssh_key_name" {
  type    = string
  default = "ghost@ghst"
}

variable "ami_id" {
  type    = string
  default = "ami-0b7937aeb16a7eb94"
}

variable "vpc_subnets" {
  type    = list(string)
  default = ["subnet-35ba424e", "subnet-6eccd724", "subnet-aa4f91c3"]
}

variable "iam_profile" {
  type    = string
  default = "liveol-server-poweruser"
}

variable "security_groups" {
  type    = list(string)
  default = ["sg-04ab20a9b3e5d8478"]
}

resource "aws_launch_configuration" "liveol_conf" {
  name_prefix          = "liveol-"
  image_id             = var.ami_id
  instance_type        = "t3.micro"
  spot_price           = "0.0045"
  iam_instance_profile = var.iam_profile
  user_data            = file("deployment.tpl")
  security_groups      = var.security_groups
  enable_monitoring    = false
  key_name             = var.ssh_key_name

  ebs_block_device = [
    {
      device_name           = "/dev/xvdz"
      volume_type           = "standard"
      volume_size           = "16"
      delete_on_termination = true
    },
  ]

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_autoscaling_group" "liveol_server" {
  name_prefix          = "liveol-"
  vpc_zone_identifier  = var.vpc_subnets
  launch_configuration = aws_launch_configuration.liveol_conf.name
  min_size             = 1
  max_size             = 1
  desired_capacity     = 1

  lifecycle {
    create_before_destroy = true
  }
}

