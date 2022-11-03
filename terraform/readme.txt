To run please follow the steps below:

1- Modify the variables in terraform.tfvars

2- Make sure to add your public and private SSH Keys to the folder and and rename them as id_rsa_devops & id_rsa_devops.pub respectivly for server provisioning

3- Initialize Terraform to download Providers

	terraform init

4- Terraform Plan

	terraform plan

5- Apply the configurations

	terraform apply

6- Finally, detroy what you built for test purposes

	terraform destroy
