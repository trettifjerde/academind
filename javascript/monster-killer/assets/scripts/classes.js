class Entity {
    hitDamage = 0;
    health = 0;
    maxHealth = 0;
    maxHeal = 0;

    constructor({hitDamage, maxHealth, healthDivId}) {
        this.hitDamage = hitDamage;
        this.configureHealth({healthDivId, maxHealth});
    }

    get isDead() {
        return this.health <= 0;
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
        const dealtDamage = Math.round(Math.random() * damage);
        this.setHealth(this.health - dealtDamage);

        return {
            damage: dealtDamage,
            isReceived: true
        }
    }

    heal() {
        const healedHealth = Math.round(Math.random() * this.maxHeal);
        this.setHealth(this.health + healedHealth);
        return healedHealth;
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

    receiveDamage(damage) {
        if (damage > this.health && this.bonusLives) {
            this.setBonusLives(this.bonusLives - 1);

            return {
                damage,
                isReceived: false
            }
        }
        else 
            return super.receiveDamage(damage);
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
        this.logEl = null;

        this.settingsDialog = document.getElementById(SETTING_DIALOG_ID);
        this.settingsForm = this.settingsDialog.querySelector('form');
        this.settingsResetButton = this.settingsDialog.querySelector('form button[type=button]');

        this.scoreDialog = document.getElementById(SCORE_DIALOG_ID);
        this.gameResult = this.scoreDialog.querySelector('h1');
        
        this.attackBtn.addEventListener('click', () => this.game.attack());
        this.strongAttackBtn.addEventListener('click', () => this.game.attack(true));
        this.healBtn.addEventListener('click', () => this.game.heal());
        this.logBtn.addEventListener('click', this.toggleLog.bind(this));

        this.settingsForm.addEventListener('submit', this.applySettings.bind(this));
        this.settingsResetButton.addEventListener('click', this.resetSettings.bind(this));
        this.scoreDialog.querySelector('button').addEventListener('click', () => this.startOver());
        
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
        this.hideValidationErrors();

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

    hideValidationErrors() {
        for (const el of this.settingsForm.elements)
            el.classList.remove('invalid');
    }

    resetSettings() {
        this.hideValidationErrors();
        this.setDefaultSettingsFormValues();
    }

    setWinner(winner) {
        this.gameResult.textContent = winner ? `${winner.name} wins!` : 'Player and Monster\nkill each other!';
        this.scoreDialog.showModal();
    }

    startOver() {
        this.scoreDialog.close();
        this._clearLog();
        this.openSettingsModal();
    }

    openSettingsModal() {
        this.settingsDialog.showModal();
    }

    toggleLog() {
        if (this.logEl) 
            this._hideLog();

        else 
            this._showLog();
    }

    updateLog() {
        if (this.logEl)
            this.logEl.innerHTML = this.game.log.getFullLog();
    }

    _showLog() {
        
        const logEl = document.createElement('section');
        logEl.id = 'log';
        logEl.innerHTML = this.game.log.getFullLog();
        document.body.appendChild(logEl);

        this.logEl = logEl;
        this.logBtn.textContent = HIDE_LOG;
    }

    _hideLog() {
        this.logEl?.remove();
        this.logEl = null;
        this.logBtn.textContent = SHOW_LOG;
    }

    _clearLog() {
        this.game.log.clear();
        this._hideLog();
    }
}

class Log {
    constructor(game) {
        this.game = game;
        this.events = [];
    }

    getFullLog() {
        return this.events.join('\n---------------\n\n')
    }

    start(settings) {
        this.events.push(`<b>GAME STARTED:</b>\nMax health: ${settings.maxHealth}\nDamage: ${settings.hitDamage}\nBonus lives: ${settings.bonusLives}\n`);
    }

    attack({playerInfo, monsterInfo, isStrongAttack}) {
        let message = this._makeStartRoundEntry();
        message += this._makeAttackEntry({
            attacker: this.game.player,
            hitInfo: monsterInfo,
            isStrongAttack
        });
        message += this._makeAttackEntry({
            attacker: this.game.monster,
            hitInfo: playerInfo
        });
        this.events.push(message);
    }

    heal({heal, playerInfo}) {
        let message = this._makeStartRoundEntry();
        message += this._makeHealEntry(heal);
        message += this._makeAttackEntry({
            attacker: this.game.monster,
            hitInfo: playerInfo
        });
        this.events.push(message);
    }

    setWinner(winner) {
        this.events.push(`<b>GAME OVER:</b> ${winner ? 
            `${winner.name} wins` : 
            `${this.game.player.name} and ${this.game.monster.name} kill each other`
        }\n`);
    }

    clear() {
        this.events = [];
    }

    _makeStartRoundEntry() {
        return `<b>ROUND ${this.events.length}</b>\n`;
    }

    _makeAttackEntry({attacker, hitInfo, isStrongAttack}) {
        const victim = attacker === this.game.monster ? this.game.player : this.game.monster;
        let message = `${attacker.name} hits ${victim.name} for ${hitInfo.damage} HP${isStrongAttack ? ' with their strong attack' : ''}`;

        if (!hitInfo.isReceived) 
            message += `, but is protected with their bonus life. Remaining lives: ${victim.bonusLives}`;

        message += '\n';
        
        return message;        
    }
    
    _makeHealEntry(heal) {
        return `${this.game.player.name} heals for ${heal} HP\n`;
    }
}

class Game {
    constructor() {
        this.monster = null;
        this.player = null;
        this.ui = new UI(this);
        this.log = new Log(this);
    }
    
    init() {
        this.ui.openSettingsModal();
    }

    start(settings) {
        const {hitDamage, maxHealth, bonusLives} = settings;

        this.monster = new Monster({hitDamage, maxHealth});
        this.player = new Player({hitDamage, maxHealth, bonusLives});
        this.log.start(settings);
    }

    attack(isStrongAttack) {
        const monsterInfo = this.monster.receiveDamage(isStrongAttack ? this.player.strongAttack : this.player.hitDamage);
        const playerInfo = this.player.receiveDamage(this.monster.hitDamage);
        
        this.log.attack({monsterInfo, playerInfo, isStrongAttack});

        this.endRound();
    }

    heal() {
        const heal = this.player.heal();
        const playerInfo = this.player.receiveDamage(this.monster.hitDamage);

        this.log.heal({heal, playerInfo});

        this.endRound();
    }

    endRound() {
        if (this.player.isDead && this.monster.isDead)
            this.setWinner();

        else if (this.player.isDead)
            this.setWinner(this.monster);

        else if (this.monster.isDead)
            this.setWinner(this.player);

        this.ui.updateLog();
    }

    setWinner(winner) {
        this.log.setWinner(winner);
        this.ui.setWinner(winner);
    }
}