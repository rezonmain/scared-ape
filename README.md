# Scared-Ape

A web scraper to make my life easier (and to practice SQL)
Visit the website at https://apeq.app, and checkout [the front end's repository](https://github.com/rezonmain/scared-ape-web)

Hey, the following steps are for me to remember how to run the app in the cloud
they are not a guide 😁

### HOW TO RUN APP IN AWS:

1. You NEED a domain (this is for setting up ssl)
2. In the aws console make sure you have selected **us-west2** as your region at the top right of the navbar
3. Create a EC2 instance, whatever is free at the time of reading, search for EC2 when it shows in the result hover over it and select instances
   ￼
4. Go through the creation steps.
   1. Name it `scared-ape-i-n` where n is the instance incremental number
   2. Choose Amazon Linux or Amazon Linux 2 for the OS image
   3. Whatever arch and processor is free tier eligible at the time
   4. In key pair, create a new one or use an existing one, if creating:
      1. Choose RSA and PEM, save it somewhere safe
   5. Create or use a security group to allow SSH, HTTPS, and HTTP traffic from anywhere `0.0.0.0/0`
   6. Storage ~16 - 24 GiB of whatever storage type is free tier eligible
   7. Create instance
5. Create a load balancer
   1. Choose Application Load Balancer
   2. Name it `scared-ape-lb-n` where n is the load balancer incremental number
   3. Choose internet-facing and IPv4
   4. Choose whatever VPC (don’t even know what this is)
   5. Select the created or chosen Security Group from when creating an instance
   6. Create a single listener for HTTPS, in the forward to, create a new target group
      1. In the target group steps choose “Instances”
      2. Name it `scared-ape-tg-n`
      3. In protocol choose HTTP _(IMPORTANT NOT TO CHOOSE HTTPS)_
      4. Select whatever VPC, HTTP1
      5. Health check default is Ok (HTTP to /)
      6. Choose Next
      7. In the instances picker, choose the created instance and finish setup
   7. Back at the load balancer steps, the default security policy is ok
   8. In the ‘Default SSL/TLS certificate’ choose ‘Request new ACM certificate’
      1. In the certificate manager, select ‘Request’
      2. In Type select ‘Request public certificate’
      3. Enter the domain name e.g. `api.apeq.app`
      4. In validation method choose DNS
      5. Click **Request**
      6. Back in the certificate listing notice status is **pending** of the newly created certificate
      7. Click into the certificate, in Domains copy te **CNAME name** field
      8. Go to the domain provider e.g. Google domains, go to DNS
      9. Fill a new DNS entry where host name should be the **CNAME name** value WITHOUT THE BASE DOMAIN e.g. CNAME name is `xxxxx.api.ape.app.`, you should enter `xxxxx.api` in the Host name field
      10. In **Type** choose **CNAME**, ttl does no matter
      11. In data, got back to the AWS certificate listings and copy the **CNAME value** field
      12. Paste this value _AS IS_ in the **Data** field in the new DNS record in the domain provider page
      13. Save the new DNS record and what for the DNS to propagate, wait until certificate status changes from **pending** to **success**
   9. Back in the load balancer steps, choose the newly created certificate
   10. Finally click on **Create Load Balancer**
   11. After the load balancer is created copy the DNS url of it
   12. Go to the domain provider page, create a new DNS record of type **CNAME**,
   13. in the hostname enter the subdomain for accessing the API e.g. `api` (which will resolve to `api.apeq.app`, in **Data** field enter the load balancer DNS url)
6. Install the api in the instance
   1. Access the instance via `ssh` using the saved `.pem` key
   2. run `sudo yum install git docker tmux`
   3. After it finishes clone the api repo `git clone https://whatever`
   4. `cd` into the api root folder and create a file named `.env`: `vim .env`
   5. Enter the env values (should be in the project of your local machine or saved in the password manager)
   6. Start the docker deamon `sudo systemctl start docker`
   7. Build the docker image `sudo docker build . -t sape`
   8. Create the database `touch scared-ape.sqlite`
   9. After it finishes run the docker image `sudo docker run -e NODE_ENV=prod -p 80:7363 --mount type=bind,source=/home/ec2-user/scared-ape/scared-ape.sqlite,target=/app/scared-ape.sqlite sape` its better if you run the container in a tmux window
   10. Acceptable values for `NODE_ENV` are `prod | stage | dev`

## TROUBLESHOOTING

- If on app boot it fails to fetch configuration file:
  - Make sure you have the oracle instance running with the config files in `/home/{USER}/vault/scared-ape/{ENV}.json5`
  - Make sure you’ve set the correct `.env` to access this files via `scp`
