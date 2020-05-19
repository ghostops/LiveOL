terraform {
  backend "s3" {
    bucket = "liveol"
    key    = "tf/server.tfstate"
    region = "eu-north-1"
  }
}

provider "digitalocean" {
  version = "~> 1.18"
}

resource "digitalocean_droplet" "server" {
  image  = "ubuntu-20-04-x64"
  name   = "LiveOL"
  region = "ams3"
  size   = "s-1vcpu-1gb"
  ssh_keys = [var.ssh_key_fingerprint]
}

resource "digitalocean_project_resources" "linkToProject" {
  project = var.do_project_id
  resources = [
    digitalocean_droplet.server.urn
  ]
}

output "droplet_ip" {
  value = digitalocean_droplet.server.ipv4_address
}
