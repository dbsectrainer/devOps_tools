document.addEventListener('DOMContentLoaded', () => {
    // Initialize collapsible sections
    initCollapsibleSections();
    
    const cheatsheets = [
        'aws', 'azure', 'docker', 'gcp', 'github',
        'grafana', 'kubernetes', 'terraform', 'vault',
        'ansible', 'devsecops', 'service-mesh', 'compliance-chaos'
    ];

    const totalDays = 18;
    const cheatsheetsListEl = document.getElementById('cheatsheets-list');
    const daysListEl = document.getElementById('days-list');
    const contentArea = document.getElementById('content-area');
    const welcomeContent = contentArea.innerHTML; // Store initial welcome content

    // Function to initialize collapsible sections
    function initCollapsibleSections() {
        const collapsibles = document.querySelectorAll('.collapsible');
        
        collapsibles.forEach(section => {
            const header = section.querySelector('.section-header');
            
            header.addEventListener('click', () => {
                section.classList.toggle('collapsed');
            });
            
            // Optionally, start with Daily Progress collapsed by default
            // since it's the longest section
            if (header.textContent.trim().startsWith('Daily Progress')) {
                section.classList.add('collapsed');
            }
        });
    }

    // Handle home link click
    document.querySelector('.home-link').addEventListener('click', (e) => {
        e.preventDefault();
        contentArea.innerHTML = welcomeContent;
    });

    // Populate cheatsheets navigation
    cheatsheets.forEach(sheet => {
        const li = document.createElement('li');
        const link = document.createElement('a');
        link.href = `#cheatsheet-${sheet}`;
        link.textContent = sheet.charAt(0).toUpperCase() + sheet.slice(1);
        link.addEventListener('click', (e) => {
            e.preventDefault();
            loadContent(`cheatsheets/${sheet}.md`);
        });
        li.appendChild(link);
        cheatsheetsListEl.appendChild(li);
    });

    // Populate days navigation
    for (let i = 1; i <= totalDays; i++) {
        const li = document.createElement('li');
        const link = document.createElement('a');
        const dayNum = String(i).padStart(2, '0');
        link.href = `#day-${dayNum}`;
        link.textContent = `Day ${dayNum}`;
        link.addEventListener('click', (e) => {
            e.preventDefault();
            loadContent(`days/day-${dayNum}/README.md`);
        });
        li.appendChild(link);
        daysListEl.appendChild(li);
    }

    // Handle tool card clicks
    document.querySelectorAll('.tool-card').forEach(card => {
        card.addEventListener('click', (e) => {
            e.preventDefault();
            const tool = card.getAttribute('data-tool');
            loadContent(`cheatsheets/${tool}.md`);
        });
    });

    // Handle getting started card clicks
    document.querySelectorAll('.getting-started-card').forEach(card => {
        card.addEventListener('click', (e) => {
            e.preventDefault();
            const day = card.getAttribute('data-day');
            loadContent(`days/day-${day}/README.md`);
        });
    });
    
    // Define day topics data
    const dayTopics = [
        { day: "01", title: "GitHub Basics", level: "beginner", topics: ["Repository Management", "Branch Operations", "Pull Requests", "GitHub Actions Intro"] },
        { day: "02", title: "Advanced GitHub Actions", level: "intermediate", topics: ["Composite Actions", "Workflow Templates", "Multi-environment Deployment", "Terraform Introduction"] },
        { day: "03", title: "Terraform & Docker", level: "intermediate", topics: ["Terraform Modules & Workspaces", "Docker Installation", "Container Lifecycle", "Image Building"] },
        { day: "04", title: "Kubernetes Basics", level: "intermediate", topics: ["Kubernetes Architecture", "Pod Management", "Deployments & Services", "ConfigMaps & Secrets"] },
        { day: "05", title: "Advanced Kubernetes", level: "advanced", topics: ["StatefulSets", "Persistent Volumes", "Helm Charts", "Custom Resources"] },
        { day: "06", title: "AWS Essentials", level: "intermediate", topics: ["IAM", "EC2", "S3", "RDS"] },
        { day: "07", title: "AWS Advanced", level: "advanced", topics: ["Lambda", "CloudFormation", "EKS", "CloudWatch"] },
        { day: "08", title: "Azure Fundamentals", level: "intermediate", topics: ["Resource Groups", "Virtual Machines", "Storage", "App Service"] },
        { day: "09", title: "GCP Essentials", level: "intermediate", topics: ["Projects", "Compute Engine", "Cloud Storage", "Cloud SQL"] },
        { day: "10", title: "Ansible Basics", level: "beginner", topics: ["Inventory", "Playbooks", "Roles", "Variables"] },
        { day: "11", title: "Advanced Ansible", level: "intermediate", topics: ["Dynamic Inventory", "Vault", "Custom Modules", "AWX/Tower"] },
        { day: "12", title: "CI/CD Pipelines", level: "intermediate", topics: ["Jenkins", "GitLab CI", "CircleCI", "ArgoCD"] },
        { day: "13", title: "Monitoring & Logging", level: "intermediate", topics: ["Prometheus", "Grafana", "ELK Stack", "Loki"] },
        { day: "14", title: "Service Mesh", level: "advanced", topics: ["Istio", "Linkerd", "Traffic Management", "Security"] },
        { day: "15", title: "DevSecOps", level: "advanced", topics: ["SAST/DAST", "Container Security", "Secret Management", "Compliance"] },
        { day: "16", title: "Chaos Engineering", level: "advanced", topics: ["Chaos Toolkit", "Chaos Mesh", "Game Days", "Resilience Testing"] },
        { day: "17", title: "GitOps", level: "intermediate", topics: ["Flux", "ArgoCD", "Declarative Deployments", "Drift Detection"] },
        { day: "18", title: "Cloud Native Architecture", level: "advanced", topics: ["Microservices", "Serverless", "Event-Driven Design", "Multi-Cloud Strategy"] }
    ];
    
    // Function to create a day card
    function createDayCard(dayInfo) {
        const card = document.createElement('a');
        card.href = "#";
        card.className = "getting-started-card";
        card.setAttribute("data-day", dayInfo.day);
        
        card.innerHTML = `
            <div class="card-header">
                <h4>Day ${dayInfo.day}: ${dayInfo.title}</h4>
                <span class="skill-level ${dayInfo.level}">${dayInfo.level}</span>
            </div>
            <div class="key-topics">
                <h5>Key Topics:</h5>
                <ul>
                    ${dayInfo.topics.map(topic => `<li>${topic}</li>`).join('')}
                </ul>
            </div>
        `;
        
        // Add click event listener
        card.addEventListener('click', (e) => {
            e.preventDefault();
            loadContent(`days/day-${dayInfo.day}/README.md`);
        });
        
        return card;
    }
    
    // Handle "View All 18 Days" button with toggle functionality
    const viewAllButton = document.getElementById('view-all-days');
    if (viewAllButton) {
        let isExpanded = false;
        
        viewAllButton.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Get the grid container
            const gridContainer = document.querySelector('.getting-started-grid');
            
            // Toggle between expanded and collapsed views
            isExpanded = !isExpanded;
            
            // Update button text
            viewAllButton.textContent = isExpanded ? "Show Less" : "View All 18 Days";
            
            // Clear existing cards
            gridContainer.innerHTML = '';
            
            if (isExpanded) {
                // Show all 18 days
                dayTopics.forEach(dayInfo => {
                    gridContainer.appendChild(createDayCard(dayInfo));
                });
            } else {
                // Show only the first 4 days
                dayTopics.slice(0, 4).forEach(dayInfo => {
                    gridContainer.appendChild(createDayCard(dayInfo));
                });
            }
        });
    }

    // Handle glossary link click
    document.getElementById('glossary-link').addEventListener('click', (e) => {
        e.preventDefault();
        loadContent('cheatsheets/devops_glossary.md');
    });

    function loadContent(path) {
        // Show loading state
        contentArea.innerHTML = '<div class="loading">Loading content...</div>';

        const xhr = new XMLHttpRequest();
        xhr.open('GET', path, true);

        xhr.onload = function() {
            if (xhr.status === 200) {
                const content = xhr.responseText;
                const htmlContent = convertMarkdownToHTML(content);
                contentArea.innerHTML = `
                    <div class="content-header">
                        <h2>${path.split('/').pop().replace('.md', '')}</h2>
                    </div>
                    <div class="markdown-content">
                        ${htmlContent}
                    </div>
                `;
                // Initialize any mermaid diagrams in the new content
                mermaid.init(undefined, document.querySelectorAll('.mermaid'));
            } else {
                showError();
            }
        };

        xhr.onerror = showError;
        xhr.send();
    }

    function showError() {
        contentArea.innerHTML = `
            <div class="error-message">
                <h2>Error Loading Content</h2>
                <p>Unable to load the requested content. Please try again later.</p>
                <p class="error-note">Note: This frontend works best when served through a web server.</p>
            </div>
        `;
    }

    function convertMarkdownToHTML(markdown) {
            let html = markdown;
            
            // Store mermaid diagrams to prevent them from being processed by other rules
            const mermaidDiagrams = [];
            html = html.replace(/```mermaid([\s\S]*?)```/g, (match, code) => {
                const id = `mermaid-${mermaidDiagrams.length}`;
                mermaidDiagrams.push({ id, code: code.trim() });
                return `MERMAID_PLACEHOLDER_${id}`;
            });
    
            // Process regular markdown
            html = html
                // Headers
                .replace(/^# (.*$)/gm, '<h1>$1</h1>')
                .replace(/^## (.*$)/gm, '<h2>$1</h2>')
                .replace(/^### (.*$)/gm, '<h3>$1</h3>')
                // Bold
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                // Italic
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                // Regular code blocks
                .replace(/```([^m][\s\S]*?)```/g, '<pre><code>$1</code></pre>')
                // Inline code
                .replace(/`(.*?)`/g, '<code>$1</code>')
                // Lists
                .replace(/^\s*[-*+]\s+(.*)/gm, '<li>$1</li>')
                // Special handling for day navigation links
                .replace(/\[(←|←\s+)Previous Day\]\((\.\.\/day-\d+\/README\.md)\)/g, function(match, arrow, path) {
                    const dayNum = path.match(/day-(\d+)/)[1];
                    return `<a href="#day-${dayNum}" class="day-nav prev-day" data-path="days/day-${dayNum}/README.md">${arrow} Previous Day</a>`;
                })
                .replace(/\[(Next Day\s+→|Next Day→)\]\((\.\.\/day-\d+\/README\.md)\)/g, function(match, text, path) {
                    const dayNum = path.match(/day-(\d+)/)[1];
                    return `<a href="#day-${dayNum}" class="day-nav next-day" data-path="days/day-${dayNum}/README.md">${text}</a>`;
                })
                // Regular links (after special handling for day navigation)
                .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
                // Paragraphs
                .replace(/^\s*(\n)?(.+)/gm, function(m) {
                    return /\<(\/)?(h\d|ul|ol|li|blockquote|pre|img)/.test(m) ? m : '<p>'+m+'</p>';
                });

        // Restore mermaid diagrams
        mermaidDiagrams.forEach(({ id, code }) => {
            html = html.replace(
                `MERMAID_PLACEHOLDER_${id}`,
                `<pre class="mermaid">${code}</pre>`
            );
        });

        // Wrap lists
        html = html.replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>');
        // Remove empty lines
        html = html.replace(/^\s*[\r\n]/gm, '');
        
        return html;
    }
    
    // Add event delegation for day navigation links
    contentArea.addEventListener('click', (e) => {
        // Check if the clicked element is a day navigation link
        if (e.target.classList.contains('day-nav') || e.target.parentElement.classList.contains('day-nav')) {
            e.preventDefault();
            const link = e.target.classList.contains('day-nav') ? e.target : e.target.parentElement;
            const path = link.getAttribute('data-path');
            if (path) {
                loadContent(path);
            }
        }
    });
});
