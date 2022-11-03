output "droplet_ip_address" {
  description = "Output the Public IP Address of th Droplet Created"
  value       = digitalocean_droplet.praise-bot.ipv4_address
}