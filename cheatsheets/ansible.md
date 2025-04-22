# Ansible Cheatsheet

*This cheatsheet provides a reference for Ansible commands, playbook syntax, and best practices.*

*Note: Ansible 2.16.0 is the latest version as of April 2025*

## Basic Commands
```bash
# Installation
pip install ansible

# Version Check
ansible --version

# Ad-hoc Commands
ansible all -m ping                                # Ping all hosts
ansible webservers -m command -a "uptime"          # Run command on group
ansible db -m shell -a "ps aux | grep mysql"       # Run shell command
ansible all -m setup                              # Gather facts
ansible all -m apt -a "name=nginx state=present"  # Install package
```

## Inventory Management
```ini
# Static Inventory Example
[webservers]
web1.example.com
web2.example.com ansible_host=192.168.1.101

[dbservers]
db1.example.com
db2.example.com

[production:children]
webservers
dbservers

[webservers:vars]
http_port=80
proxy_timeout=5

# Command Line
ansible-inventory --list                          # List all inventory
ansible-inventory --graph                         # Show inventory hierarchy
ansible-inventory --host=web1.example.com         # Show host variables
```

## Playbook Syntax
```yaml
---
- name: Configure web servers
  hosts: webservers
  become: true
  vars:
    http_port: 80
    max_clients: 200
  
  tasks:
    - name: Install Apache
      apt:
        name: apache2
        state: present
        update_cache: yes
      
    - name: Start Apache service
      service:
        name: apache2
        state: started
        enabled: yes
      
    - name: Deploy configuration
      template:
        src: templates/httpd.conf.j2
        dest: /etc/apache2/httpd.conf
      notify: Restart Apache
      
  handlers:
    - name: Restart Apache
      service:
        name: apache2
        state: restarted
```

## Common Modules
```yaml
# File Operations
- name: Create directory
  file:
    path: /etc/app
    state: directory
    mode: '0755'

- name: Copy file
  copy:
    src: files/app.conf
    dest: /etc/app/app.conf
    owner: root
    group: root
    mode: '0644'

# Package Management
- name: Install packages
  apt:
    name:
      - nginx
      - postgresql
      - python3
    state: present
    update_cache: yes

# Service Management
- name: Ensure service is running
  service:
    name: nginx
    state: started
    enabled: yes

# User Management
- name: Create user
  user:
    name: appuser
    shell: /bin/bash
    groups: admin
    append: yes

# Command Execution
- name: Run command
  command: ls -la /var/log
  register: command_output

- name: Run shell command
  shell: ps aux | grep nginx | wc -l
  register: process_count
```

## Variables and Facts
```yaml
# Variable Definition
vars:
  http_port: 80
  max_clients: 200

# Variable Files
- name: Include variables
  include_vars: vars/main.yml

# Using Variables
- name: Create configuration
  template:
    src: app.conf.j2
    dest: /etc/app/app.conf
  vars:
    app_port: "{{ http_port }}"
    app_dir: /var/www/app

# Registered Variables
- name: Check if file exists
  stat:
    path: /etc/app/app.conf
  register: config_file

- name: Display message
  debug:
    msg: "Config file exists: {{ config_file.stat.exists }}"

# Facts
- name: Show system facts
  debug:
    var: ansible_distribution

- name: Use facts in template
  template:
    src: system_info.j2
    dest: /etc/motd
```

## Control Flow
```yaml
# Conditionals
- name: Install Apache on Debian
  apt:
    name: apache2
    state: present
  when: ansible_distribution == 'Debian' or ansible_distribution == 'Ubuntu'

- name: Install Apache on RedHat
  yum:
    name: httpd
    state: present
  when: ansible_distribution == 'RedHat' or ansible_distribution == 'CentOS'

# Loops
- name: Create multiple users
  user:
    name: "{{ item }}"
    state: present
    groups: admin
  loop:
    - john
    - jane
    - bob

- name: Create directories
  file:
    path: "{{ item }}"
    state: directory
    mode: '0755'
  loop:
    - /etc/app
    - /var/www/app
    - /var/log/app

# Loop with Dictionary
- name: Create users with specific groups
  user:
    name: "{{ item.name }}"
    groups: "{{ item.groups }}"
    state: present
  loop:
    - { name: 'john', groups: 'admin' }
    - { name: 'jane', groups: 'developers' }
    - { name: 'bob', groups: 'operators' }
```

## Roles
```
# Role Structure
roles/
└── webserver/
    ├── defaults/       # Default variables
    │   └── main.yml
    ├── files/          # Static files
    ├── handlers/       # Handlers
    │   └── main.yml
    ├── meta/           # Role metadata
    │   └── main.yml
    ├── tasks/          # Tasks
    │   └── main.yml
    ├── templates/      # Jinja2 templates
    └── vars/           # Role variables
        └── main.yml

# Role Usage in Playbook
- name: Configure web servers
  hosts: webservers
  roles:
    - common
    - webserver
    - { role: database, when: "inventory_hostname in groups['dbservers']" }
```

## Templates with Jinja2
```jinja
# {{ ansible_managed }}
<VirtualHost *:{{ http_port }}>
    ServerAdmin webmaster@{{ ansible_domain }}
    ServerName {{ ansible_fqdn }}
    DocumentRoot /var/www/html
    
    {% if enable_ssl %}
    SSLEngine on
    SSLCertificateFile {{ ssl_cert_file }}
    SSLCertificateKeyFile {{ ssl_key_file }}
    {% endif %}
    
    {% for alias in server_aliases %}
    ServerAlias {{ alias }}
    {% endfor %}
    
    ErrorLog ${APACHE_LOG_DIR}/error.log
    CustomLog ${APACHE_LOG_DIR}/access.log combined
</VirtualHost>
```

## Vault
```bash
# Vault Operations
ansible-vault create secret.yml                   # Create encrypted file
ansible-vault edit secret.yml                     # Edit encrypted file
ansible-vault encrypt existing.yml                # Encrypt existing file
ansible-vault decrypt secret.yml                  # Decrypt file
ansible-vault view secret.yml                     # View encrypted file
ansible-vault rekey secret.yml                    # Change encryption key

# Running with Vault
ansible-playbook --ask-vault-pass playbook.yml    # Prompt for password
ansible-playbook --vault-password-file=vault.key playbook.yml  # Use password file
```

## Best Practices

1. **Project Structure**
```
project/
├── ansible.cfg                  # Configuration file
├── inventory/                   # Inventory files
│   ├── production
│   └── staging
├── group_vars/                  # Group variables
│   ├── all.yml
│   └── webservers.yml
├── host_vars/                   # Host variables
│   └── web1.example.com.yml
├── roles/                       # Roles
│   ├── common/
│   └── webserver/
└── playbooks/                   # Playbooks
    ├── site.yml
    ├── webservers.yml
    └── dbservers.yml
```

2. **Task Organization**
```yaml
# Use meaningful names
- name: Install required packages
  apt:
    name: "{{ required_packages }}"
    state: present
  tags:
    - packages
    - setup

# Group related tasks
- name: Configure database
  block:
    - name: Install PostgreSQL
      apt:
        name: postgresql
        state: present
    
    - name: Start PostgreSQL service
      service:
        name: postgresql
        state: started
  when: inventory_hostname in groups['dbservers']
  tags: database
```

3. **Error Handling**
```yaml
# Ignore errors
- name: Run potentially failing command
  command: /bin/false
  ignore_errors: yes

# Custom error handling
- name: Try to start service
  service:
    name: myapp
    state: started
  register: service_start
  failed_when: service_start.rc != 0 and service_start.rc != 1

# Block error handling
- name: Handle errors in block
  block:
    - name: Run risky task
      command: /usr/bin/risky_command
  rescue:
    - name: Run recovery task
      command: /usr/bin/recovery_command
  always:
    - name: Always run this task
      command: /usr/bin/cleanup_command
```

4. **Performance Optimization**
```yaml
# Fact gathering
- hosts: all
  gather_facts: no  # Disable when not needed
  
# Async tasks
- name: Long running task
  command: /usr/bin/long_task
  async: 3600       # Maximum runtime in seconds
  poll: 0           # Don't wait for completion
  
# Check mode
ansible-playbook --check playbook.yml  # Dry run without changes
```

5. **Security Best Practices**
```yaml
# Use vault for sensitive data
- name: Deploy sensitive configuration
  template:
    src: sensitive.conf.j2
    dest: /etc/app/sensitive.conf
  vars:
    db_password: "{{ vault_db_password }}"
    
# Limit privilege escalation
- name: Run as specific user
  command: /usr/bin/app_command
  become: yes
  become_user: appuser
```

## Additional Resources

- [Ansible Documentation](https://docs.ansible.com/)
- [Ansible Galaxy](https://galaxy.ansible.com/) - Community roles and collections
- [Ansible Best Practices](https://docs.ansible.com/ansible/latest/user_guide/playbooks_best_practices.html)
- [Jinja2 Documentation](https://jinja.palletsprojects.com/)
- [Ansible for DevOps](https://www.ansiblefordevops.com/) - Book by Jeff Geerling
- [DevOps Glossary](../cheatsheets/devops_glossary.md)
