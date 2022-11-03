resource "digitalocean_droplet" "praise-bot" {
  name     = "praise"
  size     = "s-2vcpu-4gb"
  image    = "ubuntu-20-04-x64"
  region   = "nyc3"
  ssh_keys = [digitalocean_ssh_key.devops-key.fingerprint]
  connection {
    user        = "root"
    type        = "ssh"
    host        = self.ipv4_address
    private_key = file("./id_rsa_devops")
    timeout     = "2m"
  }
  provisioner "file" {
    source      = "./praise_startup.sh"
    destination = "/home/praise_startup.sh"
  }
  provisioner "remote-exec" {
    inline = [
      "export HOSTNAME=${var.HOSTNAME}",
      "export DISCORD_TOKEN=${var.DISCORD_TOKEN}",
      "export DISCORD_CLIENT_ID=${var.DISCORD_CLIENT_ID}",
      "export DISCORD_GUILD_ID=${var.DISCORD_GUILD_ID}",
      "export ADMINS=${var.ADMINS}",
      "sudo chmod +x /home/praise_startup.sh",
      "/bin/bash /home/praise_startup.sh",
    ]
  }
  # provisioner "remote-exec" {
  #   inline = [
  #     "sudo chmod +x /home/praise_startup.sh",
  #     "/bin/bash /home/praise_startup.sh",
  #   ]
  # }
  # provisioner "remote-exec" {
  #   scripts = [
  #     "praise_startup.sh"
  #   ]
  # }
}

resource "digitalocean_ssh_key" "devops-key" {
  name       = "devops-key"
  public_key = file("./id_rsa_devops.pub")
}