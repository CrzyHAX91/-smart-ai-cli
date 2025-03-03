import fs from 'fs/promises';
import path from 'path';
import { ErrorHandler, ERROR_CODES, ERROR_CATEGORIES } from '../utils/errorHandler.js';

export class CloudService {
  constructor() {
    this.templates = {
      aws: {
        webapp: this.getAwsWebAppTemplate,
        database: this.getAwsDatabaseTemplate,
        serverless: this.getAwsServerlessTemplate
      },
      gcp: {
        webapp: this.getGcpWebAppTemplate,
        database: this.getGcpDatabaseTemplate,
        serverless: this.getGcpServerlessTemplate
      },
      azure: {
        webapp: this.getAzureWebAppTemplate,
        database: this.getAzureDatabaseTemplate,
        serverless: this.getAzureServerlessTemplate
      }
    };
  }

  async generateInfrastructure(options) {
    try {
      const { provider, type, name, region = 'us-east-1' } = options;
      
      if (!this.templates[provider]) {
        throw new Error(`Unsupported cloud provider: ${provider}`);
      }
      
      if (!this.templates[provider][type]) {
        throw new Error(`Unsupported infrastructure type for ${provider}: ${type}`);
      }
      
      const template = this.templates[provider][type]({ name, region });
      const filename = this.getInfrastructureFilename(provider);
      
      await fs.writeFile(filename, template);
      
      return {
        success: true,
        filename,
        provider,
        type
      };
    } catch (error) {
      throw ErrorHandler.createError(
        `Failed to generate infrastructure: ${error.message}`,
        ERROR_CODES.INFRASTRUCTURE_GENERATION_FAILED,
        ERROR_CATEGORIES.SYSTEM
      );
    }
  }

  getInfrastructureFilename(provider) {
    switch (provider) {
      case 'aws':
        return 'terraform/main.tf';
      case 'gcp':
        return 'terraform/main.tf';
      case 'azure':
        return 'terraform/main.tf';
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }

  getAwsWebAppTemplate({ name, region }) {
    return `provider "aws" {
  region = "${region}"
}

resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
  
  tags = {
    Name = "${name}-vpc"
  }
}

resource "aws_subnet" "public" {
  vpc_id     = aws_vpc.main.id
  cidr_block = "10.0.1.0/24"
  
  tags = {
    Name = "${name}-public-subnet"
  }
}

resource "aws_security_group" "web" {
  name        = "${name}-web-sg"
  description = "Security group for web servers"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"
  subnet_id     = aws_subnet.public.id
  
  vpc_security_group_ids = [aws_security_group.web.id]
  
  tags = {
    Name = "${name}-web-server"
  }
}`;
  }

  getAwsDatabaseTemplate({ name, region }) {
    return `provider "aws" {
  region = "${region}"
}

resource "aws_db_instance" "main" {
  identifier        = "${name}-db"
  allocated_storage = 20
  engine           = "mysql"
  engine_version   = "8.0"
  instance_class   = "db.t3.micro"
  username         = "admin"
  password         = "change_me_in_production"
  
  skip_final_snapshot = true
  
  tags = {
    Name = "${name}-database"
  }
}`;
  }

  getAwsServerlessTemplate({ name, region }) {
    return `provider "aws" {
  region = "${region}"
}

resource "aws_lambda_function" "main" {
  filename         = "lambda.zip"
  function_name    = "${name}-function"
  role            = aws_iam_role.lambda_role.arn
  handler         = "index.handler"
  runtime         = "nodejs14.x"

  environment {
    variables = {
      ENV = "production"
    }
  }
}

resource "aws_iam_role" "lambda_role" {
  name = "${name}-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}`;
  }

  getGcpWebAppTemplate({ name, region }) {
    return `provider "google" {
  project = "your-project-id"
  region  = "${region}"
}

resource "google_compute_network" "vpc_network" {
  name = "${name}-network"
}

resource "google_compute_instance" "vm_instance" {
  name         = "${name}-instance"
  machine_type = "e2-micro"
  zone         = "${region}-a"

  boot_disk {
    initialize_params {
      image = "debian-cloud/debian-10"
    }
  }

  network_interface {
    network = google_compute_network.vpc_network.name
    access_config {
    }
  }
}`;
  }

  getGcpDatabaseTemplate({ name, region }) {
    return `provider "google" {
  project = "your-project-id"
  region  = "${region}"
}

resource "google_sql_database_instance" "main" {
  name             = "${name}-db"
  database_version = "MYSQL_8_0"
  region           = "${region}"

  settings {
    tier = "db-f1-micro"
  }

  deletion_protection = false
}

resource "google_sql_database" "database" {
  name     = "${name}"
  instance = google_sql_database_instance.main.name
}`;
  }

  getGcpServerlessTemplate({ name, region }) {
    return `provider "google" {
  project = "your-project-id"
  region  = "${region}"
}

resource "google_cloudfunctions_function" "function" {
  name        = "${name}-function"
  description = "Serverless function"
  runtime     = "nodejs14"

  available_memory_mb   = 128
  source_archive_bucket = google_storage_bucket.bucket.name
  source_archive_object = google_storage_bucket_object.archive.name
  trigger_http          = true
  entry_point          = "handler"
}

resource "google_storage_bucket" "bucket" {
  name = "${name}-bucket"
}

resource "google_storage_bucket_object" "archive" {
  name   = "function.zip"
  bucket = google_storage_bucket.bucket.name
  source = "function.zip"
}`;
  }

  getAzureWebAppTemplate({ name, region }) {
    return `provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "main" {
  name     = "${name}-resources"
  location = "${region}"
}

resource "azurerm_virtual_network" "main" {
  name                = "${name}-network"
  address_space       = ["10.0.0.0/16"]
  location           = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
}

resource "azurerm_subnet" "internal" {
  name                 = "internal"
  resource_group_name  = azurerm_resource_group.main.name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = ["10.0.2.0/24"]
}

resource "azurerm_linux_virtual_machine" "main" {
  name                = "${name}-vm"
  resource_group_name = azurerm_resource_group.main.name
  location           = azurerm_resource_group.main.location
  size               = "Standard_F2"
  admin_username     = "adminuser"

  network_interface_ids = [
    azurerm_network_interface.main.id,
  ]

  admin_ssh_key {
    username   = "adminuser"
    public_key = file("~/.ssh/id_rsa.pub")
  }

  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Standard_LRS"
  }

  source_image_reference {
    publisher = "Canonical"
    offer     = "UbuntuServer"
    sku       = "18.04-LTS"
    version   = "latest"
  }
}`;
  }

  getAzureDatabaseTemplate({ name, region }) {
    return `provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "main" {
  name     = "${name}-resources"
  location = "${region}"
}

resource "azurerm_mysql_server" "main" {
  name                = "${name}-mysqlserver"
  location           = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name

  administrator_login          = "mysqladmin"
  administrator_login_password = "change_me_in_production"

  sku_name   = "B_Gen5_2"
  storage_mb = 5120
  version    = "8.0"

  auto_grow_enabled                = true
  backup_retention_days           = 7
  geo_redundant_backup_enabled    = false
  infrastructure_encryption_enabled = false
  public_network_access_enabled    = true
  ssl_enforcement_enabled         = true
}`;
  }

  getAzureServerlessTemplate({ name, region }) {
    return `provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "main" {
  name     = "${name}-resources"
  location = "${region}"
}

resource "azurerm_storage_account" "main" {
  name                     = "${name}storage"
  resource_group_name      = azurerm_resource_group.main.name
  location                = azurerm_resource_group.main.location
  account_tier            = "Standard"
  account_replication_type = "LRS"
}

resource "azurerm_function_app" "main" {
  name                      = "${name}-function"
  location                 = azurerm_resource_group.main.location
  resource_group_name      = azurerm_resource_group.main.name
  app_service_plan_id     = azurerm_app_service_plan.main.id
  storage_account_name     = azurerm_storage_account.main.name
  storage_account_access_key = azurerm_storage_account.main.primary_access_key

  app_settings = {
    FUNCTIONS_WORKER_RUNTIME = "node"
    WEBSITE_NODE_DEFAULT_VERSION = "~14"
  }
}

resource "azurerm_app_service_plan" "main" {
  name                = "${name}-service-plan"
  location           = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  kind               = "FunctionApp"

  sku {
    tier = "Dynamic"
    size = "Y1"
  }
}`;
  }
}
