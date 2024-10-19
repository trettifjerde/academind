class Entity {
    constructor({hitStrength, maxHealth, healthDivId}) {

        this.hitStrength = hitStrength;
        this.maxHealth = maxHealth;

        const healthDiv = document.getElementById(healthDivId);
        this.healthBar = healthDiv.querySelector('progress');
        this.healthSpan = healthDiv.querySelector('span');

        this.healthBar.max = maxHealth;
        this.setHealth(maxHealth);
    }

    attack(entity) {
        entity.receiveDamage(this.hitStrength);
    }

    receiveDamage(damage) {
        const dealtDamage = Math.floor(Math.random() * damage);
        this.setHealth(this.health - dealtDamage);
        return dealtDamage;
    }

    setHealth(health) {
        this.health = Math.max(0, Math.min(health, this.maxHealth));
        this.healthBar.value = this.health;
        this.healthSpan.textContent = this.health;
    }

    increaseHealth(health) {
        this.healthBar.value = Math.min(this.health + health, this.maxHealth);
    }
}

class Player extends Entity {
    constructor({bonusLives, hitStrength, maxHealth}) {
        super({hitStrength, maxHealth, healthDivId: PLAYER_HP_ID});

        this.bonusLivesEl = document.getElementById(BONUS_LIVES_ID);
        this.setBonusLives(bonusLives);

        this.name = 'Player';
    }

    setBonusLives(bonusLives) {
        this.bonusLives = bonusLives;
        this.bonusLivesEl.textContent = bonusLives;
    }
}

class Monster extends Entity {
    constructor({hitStrength, maxHealth}) {
        super({hitStrength, maxHealth, healthDivId: MONSTER_HP_ID});

        this.name = 'Monster';
    }
}

class UI {
    constructor(game) {
        this.game = game;

        this.attackBtn = document.getElementById(ATTACH_BTN_ID);
        this.strongAttackBtn = document.getElementById(STRONG_ATTACK_bTN_ID);
        this.healBtn = document.getElementById(HEAL_BTN_ID);
        this.logBtn = document.getElementById(LOG_BTN_ID);
        this.settingsDialog = document.getElementById(SETTING_DIALOG_ID);
        this.settingsForm = this.settingsDialog.querySelector('form');
        this.scoreDialog = document.getElementById(SCORE_DIALOG_ID);
        this.gameResult = this.scoreDialog.querySelector('h1');
        
        this.attackBtn.addEventListener('click', this.attack.bind(this));
        this.settingsForm.addEventListener('submit', this.applySettings.bind(this));
        this.scoreDialog.querySelector('button').addEventListener('click', this.startOver.bind(this));
        
        this.setInitialValues();
    }

    setInitialValues() {
        this.setDefaultSettingsFormValues();
    }

    setDefaultSettingsFormValues() {
        for (const key in SETTINGS_DEFAULTS) 
            this.settingsForm[key].value = SETTINGS_DEFAULTS[key];
    }

    attack() {
        this.game.attack();
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
                case HIT_STRENGTH:
                case MAX_HEALTH: 
                    if (settingValue === 0) {
                        this.markSettingInvalid(keyName);
                        continue;
                    }
                
                default: 
                    settings[keyName] = settingValue;
            }
        }

        if ((MAX_HEALTH in settings) && (HIT_STRENGTH in settings) && (BONUS_LIVES in settings))
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
        const {hitStrength, maxHealth, bonusLives} = settings;

        this.monster = new Monster({hitStrength, maxHealth});
        this.player = new Player({hitStrength, maxHealth, bonusLives});
    }

    attack() {
        this.player.attack(this.monster);
        this.monster.attack(this.player);

        if (this.player.health <= 0 || this.monster.health <= 0) {
            if (this.player.health <= 0 && this.monster.health <= 0) {
                this.setWinner();
            }

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