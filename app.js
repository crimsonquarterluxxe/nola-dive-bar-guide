// Main application logic
class NOLAGuide {
    constructor() {
        this.totalScore = 0;
        this.completedChallenges = new Set();
        this.init();
    }

    init() {
        this.loadFromStorage();
        this.bindEvents();
        this.updateUI();
    }

    loadFromStorage() {
        const saved = localStorage.getItem('nola-guide-progress');
        if (saved) {
            const data = JSON.parse(saved);
            this.totalScore = data.totalScore || 0;
            this.completedChallenges = new Set(data.completedChallenges || []);
        }
    }

    saveToStorage() {
        const data = {
            totalScore: this.totalScore,
            completedChallenges: Array.from(this.completedChallenges),
            lastUpdated: new Date().toISOString()
        };
        localStorage.setItem('nola-guide-progress', JSON.stringify(data));
    }

    bindEvents() {
        // Challenge items
        document.querySelectorAll('.challenge-item').forEach(item => {
            item.addEventListener('click', () => {
                const points = parseInt(item.dataset.points);
                this.toggleChallenge(item, points);
            });
        });

        // Navigation buttons
        document.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                this.handleAction(action);
            });
        });
    }

    toggleChallenge(element, points) {
        const challengeText = element.querySelector('.challenge-text').textContent;
        const checkbox = element.querySelector('.completion-checkbox');
        
        if (element.classList.contains('completed')) {
            // Uncomplete
            element.classList.remove('completed');
            checkbox.checked = false;
            this.totalScore -= points;
            this.completedChallenges.delete(challengeText);
        } else {
            // Complete
            element.classList.add('completed');
            checkbox.checked = true;
            this.totalScore += points;
            this.completedChallenges.add(challengeText);
            this.showCompletionEffect(element);
        }
        
        this.updateUI();
        this.saveToStorage();
    }

    updateUI() {
        // Update score display
        const scoreElement = document.getElementById('totalScore');
        if (scoreElement) {
            scoreElement.textContent = this.totalScore + ' Points';
        }

        // Update achievement level
        const levelElement = document.getElementById('currentLevel');
        if (levelElement) {
            if (this.totalScore >= 500) {
                levelElement.textContent = 'Dive Bar Legend';
                levelElement.className = 'achievement-level legend';
            } else if (this.totalScore >= 250) {
                levelElement.textContent = 'Honorary Local';
                levelElement.className = 'achievement-level honorary';
            } else {
                levelElement.textContent = 'Rookie Explorer';
                levelElement.className = 'achievement-level rookie';
            }
        }

        this.updateBadges();
    }

    updateBadges() {
        // Update achievement badges based on progress
        const badges = {
            'badge-rookie': this.totalScore >= 125,
            'badge-honorary': this.totalScore >= 250,
            'badge-legend': this.totalScore >= 500
        };

        Object.entries(badges).forEach(([badgeId, earned]) => {
            const badge = document.getElementById(badgeId);
            if (badge) {
                badge.classList.toggle('earned', earned);
            }
        });
    }

    showCompletionEffect(element) {
        element.style.transform = 'scale(1.05)';
        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, 200);
    }

    handleAction(action) {
        switch(action) {
            case 'share-instagram':
                this.shareToInstagram();
                break;
            case 'share-facebook':
                this.shareToFacebook();
                break;
            case 'share-twitter':
                this.shareToTwitter();
                break;
            case 'reset-progress':
                this.resetProgress();
                break;
        }
    }

    shareToInstagram() {
        const text = `Just earned ${this.totalScore} points in the NOLA Dive Bar Guide! 🍺🏆 #NOLADiveBars #CrimsonQuarter`;
        if (navigator.share) {
            navigator.share({
                title: 'NOLA Dive Bar Adventure',
                text: text,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(text);
            alert('Text copied! Paste it in your Instagram post.');
        }
    }

    shareToFacebook() {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
        window.open(url, '_blank');
    }

    shareToTwitter() {
        const text = `Just earned ${this.totalScore} points in the NOLA Dive Bar Guide! 🍺🏆 #NOLADiveBars`;
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`;
        window.open(url, '_blank');
    }

    resetProgress() {
        if (confirm('Are you sure you want to reset all progress?')) {
            this.totalScore = 0;
            this.completedChallenges.clear();
            document.querySelectorAll('.challenge-item').forEach(item => {
                item.classList.remove('completed');
                item.querySelector('.completion-checkbox').checked = false;
            });
            this.updateUI();
            this.saveToStorage();
        }
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.nolaGuide = new NOLAGuide();
});

// Global functions for inline event handlers
function shareProgress(platform) {
    if (window.nolaGuide) {
        window.nolaGuide.handleAction(`share-${platform}`);
    }
}
