class Entity {
    hitDamage = 0;
    health = 0;
    maxHealth = 0;
    maxHeal = 0;

    constructor({hitDamage, maxHealth, healthDivId}) {
        this.hitDamage = hitDamage;
        this.configureHealth({healthDivId, maxHealth});
    }

    configureHealth({healthDivId, maxHealth}) {
        this.maxHealth = maxHealth;
        this.maxHeal = Math.round(maxHealth * 0.5);

        const healthDiv = document.getElementById(healthDivId);
        this.healthSpan = healthDiv.querySelector('span');
        this.healthBar = healthDiv.querySelector('progress');
        this.healthBar.max = maxHealth;

        this.setHealth(maxHealth);
    }

    setHealth(health) {
        this.health = Math.max(0, Math.min(Math.round(health), this.maxHealth));
        this.healthBar.value = this.health;
        this.healthSpan.textContent = this.health;
    }

    receiveDamage(damage) {
        const dealtDamage = Math.random() * damage;
        this.setHealth(this.health - dealtDamage);
        return dealtDamage;
    }

    heal() {
        const health = this.health + Math.random() * this.maxHeal;
        this.setHealth(health);
    }
}

class Player extends Entity {
    constructor({bonusLives, hitDamage, maxHealth}) {
        super({hitDamage, maxHealth, healthDivId: PLAYER_HP_ID});

        this.bonusLivesEl = document.getElementById(BONUS_LIVES_ID);
        this.setBonusLives(bonusLives);

        this.strongAttack = hitDamage * 1.5;
        this.healSpellStrength = maxHealth * 0.5
        this.name = 'Player';
    }

    setBonusLives(bonusLives) {
        this.bonusLives = bonusLives;
        this.bonusLivesEl.textContent = bonusLives;
    }
}

class Monster extends Entity {
    constructor({hitDamage, maxHealth}) {
        super({hitDamage, maxHealth, healthDivId: MONSTER_HP_ID});

        this.name = 'Monster';
    }
}

class UI {
    constructor(game) {
        this.game = game;

        this.attackBtn = document.getElementById(ATTACK_BTN_ID);
        this.strongAttackBtn = document.getElementById(STRONG_ATTACK_bTN_ID);
        this.healBtn = document.getElementById(HEAL_BTN_ID);
        this.logBtn = document.getElementById(LOG_BTN_ID);

        this.settingsDialog = document.getElementById(SETTING_DIALOG_ID);
        this.settingsForm = this.settingsDialog.querySelector('form');
        this.scoreDialog = document.getElementById(SCORE_DIALOG_ID);
        this.gameResult = this.scoreDialog.querySelector('h1');
        
        this.attackBtn.addEventListener('click', () => this.game.attack());
        this.strongAttackBtn.addEventListener('click', () => this.game.attack(true));
        this.healBtn.addEventListener('click', () => this.game.heal());
        this.settingsForm.addEventListener('submit', this.applySettings.bind(this));
        this.scoreDialog.querySelector('button').addEventListener('click', () => this.startOver());
        
        this.setInitialValues();
    }

    setInitialValues() {
        this.setDefaultSettingsFormValues();
    }

    setDefaultSettingsFormValues() {
        for (const key in SETTINGS_DEFAULTS) 
            this.settingsForm[key].value = SETTINGS_DEFAULTS[key];
    }

    applySettings(e) {
        e.preventDefault();

        const settings = this.getValidatedSettings();
        if (!settings)
            return;

        this.settingsDialog.close();
        this.resetSettingsForm();

        this.game.start(settings);
    }

    getValidatedSettings() {
        const data = Object.fromEntries(new FormData(this.settingsForm));
        const settings = {}; 

        for (const keyName in data) {
            const settingValue = +data[keyName].trim();

            if (isNaN(settingValue)) {
                this.markSettingInvalid(keyName);
                continue;
            }

            switch (keyName) {
                case HIT_DAMAGE:
                case MAX_HEALTH: 
                    if (settingValue === 0) {
                        this.markSettingInvalid(keyName);
                        continue;
                    }
                
                default: 
                    settings[keyName] = settingValue;
            }
        }

        if ((MAX_HEALTH in settings) && (HIT_DAMAGE in settings) && (BONUS_LIVES in settings))
            return settings;
        
        return null;
    }

    markSettingInvalid(keyName) {
        this.settingsForm[keyName].classList.add('invalid');
    }

    resetSettingsForm() {
        for (const el of this.settingsForm.elements)
            el.classList.remove('invalid');

        this.setDefaultSettingsFormValues();
    }

    setWinner(winner) {
        this.gameResult.textContent = winner ? `${winner} wins!` : 'Player and Monster\nkill each other!';
        this.scoreDialog.showModal();
    }

    startOver() {
        this.scoreDialog.close();
        this.openSettingsModal();
    }

    openSettingsModal() {
        this.settingsDialog.showModal();
    }
}

class Game {
    constructor() {
        this.monster = null;
        this.player = null;
        this.ui = new UI(this);
    }
    
    init() {
        this.ui.openSettingsModal();
    }

    start(settings) {
        const {hitDamage, maxHealth, bonusLives} = settings;

        this.monster = new Monster({hitDamage, maxHealth});
        this.player = new Player({hitDamage, maxHealth, bonusLives});
    }

    attack(isStrongAttack) {
        this.monster.receiveDamage(isStrongAttack ? this.player.strongAttack : this.player.hitDamage);
        this.player.receiveDamage(this.monster.hitDamage);

        this.endRound();
    }

    heal() {
        this.player.heal();
        this.player.receiveDamage(this.monster.hitDamage);

        this.endRound();
    }

    endRound() {
        if (this.player.health <= 0 || this.monster.health <= 0) {
            if (this.player.health <= 0 && this.monster.health <= 0) 
                this.setWinner();

            else if (this.player.health <= 0)
                this.setWinner(this.monster.name);

            else 
                this.setWinner(this.player.name);
        }
    }

    setWinner(winner) {
        this.ui.setWinner(winner);
    }
}