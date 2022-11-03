resource "digitalocean_project" "GeneralMagicTest" {
  name        = "GeneralMagicTest"
  description = "A project to include General Magic Resources"
  resources   = [digitalocean_droplet.praise-bot.urn]
}
