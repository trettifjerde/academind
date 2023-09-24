import maps from './maps.json' assert {type: 'json'};
import currentOcap from './2023_01_29__22_33_21__1_ocap.json' assert {type: 'json'};

const tagRegex = /\[(.*?)\]/; // Get squad tag from name. Ex: [ZN]soda => ZN


function arrayEquals(a, b) {
  return Array.isArray(a) &&
    Array.isArray(b) &&
    a.length === b.length &&
    a.every((val, index) => val === b[index]);
}
class Entities {
    constructor() {
      this._units = {};
      this._vehicles = {};
    }

    addUnit(unit) {
      this._units[unit.id.toString()] = unit;
    }

    addVehicle(vehicle) {
      this._vehicles[vehicle.id.toString()] = vehicle;
    }
  
    getAll() {
      return Object.values({...this._units, ...this._vehicles});
    }

    getAllUnits() { return Object.values(this._units); }

    getAllVehicles() { return Object.values(this._vehicles) };
  
    getById(id) {
      return {...this._units, ...this._vehicles}[id.toString()];
    }

    getUnit(id) {
      return this._units[id.toString()];
    }

    getVehicle(id) {
      return this._vehicles[id.toString()];
    }

  }
  
  class Entity {
    constructor(startFrameNum, id, name, positions, description) {
      this._startFrameNum = startFrameNum;
      this._id = id;
      this._name = name;
      this._positions = positions; // pos, dir, alive
      this._currentPosition = [];
      this._description = description;
      this._marker = null;
      this._markerEl = null;
      this._markerIcon = null;
      this._lockMarkerIcon = false; // When true, prevent marker icon from being changed
      this._alive = 1;
      this._sideColor = '#000000';
      this._markerRotationOrigin = '50% 50%';
    }

    get id() { return this._id;}
    get sideColor() { return this._sideColor; }
    get name() {return this._name; }
    get marker() { return this._marker; }
    get markerEl() {return this._markerEl; }
    get markerIcon() {return this._markerIcon; }
    get alive() { return this._alive; }
    get positions() { return this._positions;}

    setAlive(alive) {
      //super class method is only called when child class registered alive change
      alive ? this._markerEl.classList.remove('unit-dead') : this._markerEl.classList.add('unit-dead');
      this._alive = alive;
    }

    setSideColor(side) {
      switch (side.toLowerCase()) {
        case 'west':
          this._sideColor = '#004d99';
          break;
        case 'east':
          this._sideColor = '#800000';
          break;
        case 'guer':
          this._sideColor = '#007f00';
          break;
        case 'civ':
          this._sideColor = '#650080';
          break;
      }
    }
  
    // Correct index by taking into account startFrameNum.
    // e.g. If requested frame is 31, and entity startFrameNum is 30,
    // then relative frame index is 1 (31-30).
    // If relative index is < 0, then entity doesn't exist yet
    getRelativeFrameIndex(f) {
      const refF = f - this._startFrameNum;
      // Entity not yet spawned or already is in garbage collector
      if (refF >= 0 && refF < this.positions.length)
        return refF;
      return null;
    }
  
    getPosAtFrame(f) {
      const relF = this.getRelativeFrameIndex(f);
      if (relF !== null)
        return this.positions[relF].position;
      return null;
    }
  
    getLatLng(f) {
      const pos = this.getPosAtFrame(f);
      if (pos)
        return armaToLatLng(pos);
      return null;
    }
  
    createMarker(latLng) {
      const div = document.createElement('div');
      div.className = `unit-icon unit-icon-${this._type}`;

      const divIcon = document.createElement('div');
      divIcon.id = `unit-id-${this._id}`;
      divIcon.className = this.side;
      divIcon.innerHTML = `${div.outerHTML} <div class='unit-title'>${this._name}</div>`;

      const icon = L.divIcon({
          iconSize: [20, 20],
          className: '',
          html: divIcon
      });
      const marker = L.marker(latLng, {
        icon: icon
      }).addTo(map);
  
      div.style.transform = `rotate(${this._markerRotationOrigin}deg)`;

      this._marker = marker;
      this._markerEl = marker.getElement();
      this._markerIcon = marker.getElement().children[0];
    }

    showMarker() {
        this._markerEl?.classList.remove('none');
    }

    hideMarker() {
        this._markerEl?.classList.add('none');
    }
  
    // Update entity position, direction, and alive status at valid frame
    _updateAtFrame(info) {
      const alive = info.alive;
      const position = info.position;

      if (! arrayEquals(this._currentPosition, position)) {
        this._currentPosition = position;
        const latLng = armaToLatLng(position);
        // Set pos
        if (this._markerEl)
          this._marker.setLatLng(latLng);
        else
          this.createMarker(latLng);
      }
  
      // Set alive status
      this.setAlive(alive);

      if (alive)
        // Set direction
        this.markerIcon.querySelector('.unit-icon').style.transform = `rotate(${info.direction}deg)`;
    }
  
    // Manage entity at given frame
    manageFrame(f) {
      const relFI = this.getRelativeFrameIndex(f);
  
      if (relFI === null)
        this.removeFromFrame();
      else
        this._updateAtFrame(this.positions[relFI]);
    }

    removeFromFrame() {
      this.hideMarker();
    }
  }
  
  class Unit extends Entity {
    constructor(
      startFrameNum,
      id,
      name,
      group,
      description,
      side,
      isPlayer,
      positions,
      framesFired
    ) {
      super(startFrameNum, id, name, positions, description);
      this._group = group;
      this._side = side;
      this._isPlayer = startFrameNum == 0 ? isPlayer : 0;
      this._framesFired = framesFired;
      this._isInVehicle = 0;
      this._vehicle = null;
      this._type = 'man';
      this._element = null; // group lobby dom element
      this._markerRotationOrigin = '50% 60%';

      this.setSideColor(side);
      this.createLobbyEntry();

    }

    get isPlayer() { return this._isPlayer;}
    get isInVehicle() {return this._isInVehicle};
    get vehicle() { return this._vehicle; }
    get framesFired() { return this._framesFired; }
    get side() { return this._side; }
    get group() { return this._group; }
    get element() { return this._element;}
  
    createMarker(latLng) {
      super.createMarker(latLng, this);
      if (! this._isPlayer) {
        this._markerIcon.classList.add('disconnected');
      }

      this._marker.getElement().addEventListener('click', ()=> {
        if (this._isPlayer) {
          window.open(`/profile/${this._name.split(']').pop()}`, '_blank');
        }
      });
    }

    removeFromFrame() {
      super.removeFromFrame();
      if (this._markerEl){
        this.connect(0);
        this.setAlive(0);
      }
    }
  
    _updateAtFrame(info) {
      super._updateAtFrame(info);
      this.updateState(info);
    }

    connect(isPlayer) {
      if (isPlayer)
        this._markerIcon.classList.remove('disconnected');
      else
        this._markerIcon.classList.add('disconnected');
      this._isPlayer = isPlayer;
    }

    updateState(info) {
      if (info.name != this._name) {
        this._name = info.name;
        this._markerIcon.querySelector('.unit-title').innerHTML = info.name;
        this._element.children[0].innerHTML = info.name; // update name in lobby
      }

      if (this._isPlayer != info.isPlayer)
        this.connect(info.isPlayer);

      if (this._isPlayer && this._isInVehicle != info.isInVehicle){ 
        if (info.isInVehicle)
          this.hideMarker();
        else {
          this._isInVehicle = 0;
          this.showMarker();
        }
      }
    }
  
    createLobbyEntry() {
      const divUnit = document.createElement('div');
      divUnit.className = 'lobby__units-row none';

      divUnit.addEventListener('click', () => {
        if (window.innerHeight > window.innerWidth)
          ui.leftPanel.classList.remove('left_active');
        map.setView(this._marker.getLatLng(), map.getZoom(), { animate: true });
        if (this._isInVehicle){
          this._vehicle?.showPopup();
        }
      });

      divUnit.innerHTML = `<span class="lobby__units-row-name ${this._side}">${
        this._name
      }</span><span class="lobby__units-row-description">${
        this._description
      }</span>`;

      this._element = divUnit;
      this._group.element.append(this.element);    
    }
  
    setAlive(alive) {
      if (this._alive !== alive) {
        super.setAlive(alive);
      }
    }

    getNameAtFrame(frame) {
      let relF = this.getRelativeFrameIndex(frame);
      if (relF === null)
        return null;
      else
        return this.positions[relF].name;
    }
}
  
  class Vehicle extends Entity {
    constructor(startFrameNum, id, type, name, positions) {
      super(startFrameNum, id, name, positions);
      this._type = type;
      this._crew = [];
      this._driver = null;
    }
  
    createMarker(latLng) {
      super.createMarker(latLng, this);
      const popup = L.popup({
        autoPan: false,
        autoClose: true,
        closeButton: true,
        className: 'leaflet-popup-vehicle',
      });
      popup.setContent(`<b>${this.name}</b>`);
      this.marker.bindPopup(popup);
      this._markerEl.addEventListener('click', ()=> this.updatePopup());
    }
  
    _updateAtFrame(info) {
      super._updateAtFrame(info);
      this.setCrew(info.crew);
    }

    setAlive(alive) {
      if (this.alive !== alive) 
        super.setAlive(alive);
    }
  
    setCrew(crew) {
      if (!arrayEquals(this._crew, crew)){
        this._crew = crew;

        if (crew.length > 0) {
          this._driver = entities.getUnit(crew[0]);

          crew.forEach(unitId => {
            const unit = entities.getUnit(unitId);
            unit._isInVehicle = 1;
            unit.hideMarker();
            if (unit.isPlayer)
              unit._vehicle = this;
          });
        }
        else 
          this._driver = null;

        this.markerIcon.className = this.side;
      }

      if (this.marker.getPopup().isOpen())
        this.updatePopup();
    }

    updatePopup() {
      let content = `<b>${this.name}</b>`;
      for (const mem of this._crew) {
        const unit = entities.getUnit(mem);
        content += `<br>${unit.name}${unit.alive ? '' : ' (r.i.p.)'}${unit.isPlayer ? '' : ' (отключен)'}`;
      }
      this.marker.getPopup().setContent(content);
    }

    showPopup() {
      this.updatePopup();
      this.marker.openPopup();
    }

    get crew() { return this._crew;}
    get driver() { return this._driver; }
    get side() { return this.driver ? this.driver.side : 'empty'; }
  }
  
  class UI {
    constructor() {
      this.leftPanel = null;
      this.rightPanel = null;
      this.bottomPanel = null;
      this.squadStats = null;
      this.playerStats = null;
      this.eventList = null;
      this.listWest = null;
      this.listEast = null;
      this.listGuer = null;
      this.listCiv = null;
      this.playersWest = null;
      this.playersEast = null;
      this.playersGuer = null;
      this.playersCiv = null;
      this.missionCurTime = null;
      this.missionEndTime = null;
      this.frameSlider = null;
      this.missionName = null;
      this.backButton = null;
      this.playButton = null;
      this.forwardButton = null;
      this.playbackSpeed = null;
      this.playbackMultiplier = 1;

      this.timer = null;
      this.frame = 0;
      this.endFrame = null;
      this.killines = [];
      this.firelines = [];

      this.fraggers = new Map();
  
      this._init();
    }
  
    _init() {

      this.squadStats = document.getElementById('squad-stats-tables-container');
      this.playerStats = document.getElementById('fraggers-table');
      document.getElementById("showStats").addEventListener('click', () => 
        document.getElementById("statsModal").classList.toggle('dialog__active'));
      document.getElementById("dialog__close").addEventListener('click', () => 
        document.getElementById("statsModal").classList.remove('dialog__active'));
  
      // Setup top panel
      this.missionName = document.getElementById('missionName');
  
      // Setup left panel
      this.leftPanel = document.getElementById('playersList');
      document.getElementById("showPlayers").addEventListener('click', () => 
        this.leftPanel.classList.toggle("left_active"));
  
      this.playersWest = document.getElementById('blufor');
      this.playersEast = document.getElementById('opfor');
      this.playersGuer = document.getElementById('guer');
      this.playersCiv = document.getElementById('civ');

      this.leftPanel.querySelectorAll('.lobby-sides-item').forEach(btn => 
        btn.addEventListener('click', () => {
          this.leftPanel.querySelectorAll('.lobby__units-item').forEach(log => log.classList.add('none'));
          this.leftPanel.querySelector(`#lobby-${btn.id}`).classList.remove('none');
        }));
  
      // Define group side elements
      this.listWest = document.getElementById('lobby-blufor');
      this.listEast = document.getElementById('lobby-opfor');
      this.listGuer = document.getElementById('lobby-guer');
      this.listCiv = document.getElementById('lobby-civ');
  
      // Setup right panel
      this.eventList = document.getElementById('log');
      this.rightPanel = document.getElementById('missionLog');
      document.getElementById('showLog').addEventListener('click', () => 
        this.rightPanel.classList.toggle("right_active"));
  
      // Setup bottom panel
      this.bottomPanel = document.getElementById('footer__inner');
      this.missionCurTime = document.getElementById('missionCurTime');
      this.missionEndTime = document.getElementById('missionEndTime');
      this.frameSlider = document.querySelector('.slider');
  
      $(this.frameSlider).on('slide', (event, slider) => {
        this.setNextFrame(slider.value);
        this.showFrame();
      });
  
      this.backButton = document.getElementById('backBtn');
      this.backButton.addEventListener('click', () => {
        this.setNextFrame(this.frame - 1);
        this.showFrame();
      });
      this.playButton = document.getElementById('playBtn');
      this.playButton.addEventListener('click', () => this.playPause());
      this.forwardButton = document.getElementById('forwardBtn');
      this.forwardButton.addEventListener('click', () => {
          this.setNextFrame();
          this.showFrame();
      });
  
      // Change speeder button selection
      this.bottomPanel.querySelectorAll('.speeder__button').forEach(btn => 
        btn.addEventListener('click', () => {

          if (btn.classList.contains('speeder__button-active')) {
            if (window.innerHeight > window.innerWidth) {
              document.querySelectorAll('.speeder__button').forEach(btn => btn.style.display = 'block');
              document.addEventListener('click', () => {
                document.querySelectorAll('.speeder__button').forEach(btn => btn.style.display = '');
              }, {once: true, capture: true});
            }
          }
          else {
            this.playbackMultiplier = btn.dataset.speed;
            if (this.timer) {
              clearInterval(this.timer);
              this.setTimer();
            }
            this.bottomPanel.querySelector('.speeder__button-active').classList.remove('speeder__button-active');
            btn.classList.add('speeder__button-active');
          }
        })
      );
  
      $('#fraggers-table').on('click', '.fraggers-row', (e) => this.showFrags(e));
  
      $(window).keypress((event) => {
        if (event.keyCode == 32) {
          ui.playPause();
        }
      });

    }
  
    // Set mission time based on given frame
    // Move playback + slider to given frame in time
    setMissionCurTime() {
      missionCurDate.setTime(this.frame * frameCaptureDelay);
      this.missionCurTime.textContent = dateToTimeString(missionCurDate);
      this.updateSlider(this.frame);
    }
  
    updateSlider(f) {
      $('.slider').slider({
        range: 'min',
        value: f,
        min: 0,
        max: this.endFrame,
      });
    }
  
    updateSideCounts() {
      const counts = {
        west: 0,
        east: 0,
        guer: 0,
        civ: 0
      };

      entities.getAllUnits().forEach(unit => {
        if (unit.isPlayer && unit.alive){
          counts[unit.side]++;
        }
      });
      
      this.playersWest.textContent = counts.west;
      this.playersEast.textContent = counts.east;
      this.playersGuer.textContent = counts.guer;
      this.playersCiv.textContent = counts.civ;
    }

    registerKill(shooterName, side, desc, victimName, isVictimUnit, isTK, details) {
      if (! this.fraggers.has(shooterName)){
        const tagSearch = tagRegex.exec(shooterName);
        const tag = tagSearch ? tagSearch[1] : 'Одиночки';

        this.fraggers.set(shooterName, {
          tag: tag,
          side: side,
          desc: desc,
          kills: 0,
          teamkills: 0,
          victims: []
        });
      }
      const fragger = this.fraggers.get(shooterName);
      if (isVictimUnit) {
        if (isTK)
          fragger.teamkills++
        else
          fragger.kills++;
      }
      
      fragger.victims.push([isTK, isVictimUnit, victimName, ...details]);
    }
  
    getSortedStats() {
      const topFraggers = [];
      const killerSquads = {};
      const sides = new Map();

      for (const [name, info] of this.fraggers) {
        const tag = info.tag;
        const side = info.side;
        const desc = info.desc;
        const kills = info.kills;
        const teamkills = info.teamkills;

        topFraggers.push([name, side, desc, kills, teamkills]);

        if (! sides.has(side))
          sides.set(side, new Map());
        
        if (! sides.get(side).has(tag))
          sides.get(side).set(tag, [0, 0]);

        sides.get(side).get(tag)[0] += kills;
        sides.get(side).get(tag)[1] += teamkills;
      }

      topFraggers.sort((a, b) => b[3] - a[3]);

      for (const [side, squadinfo] of sides) {
        killerSquads[side] = [];

        for (const [tag, kills] of squadinfo) {
          killerSquads[side].push([tag, ...kills]);
        }

        killerSquads[side].sort((a, b) => b[1] - a[1]);
      }

      return [topFraggers, killerSquads];
  
    }
  
    fillStats() {

      const [topFraggers, squads] = this.getSortedStats();
  
      for (const side in squads) {
        const table = document.createElement('div');
        table.className = "statistic-table";
        let content = '<div class="fragger-info event-details"><div class="fragger-name">Отряд</div>';
        content += '<div class="kill">Свои</div><div class="kill">Враг</div></div>';

        for (const [tag, kills, teamkills] of squads[side]) {
          content += '<div class="fragger-info">'
          if (tag !== 'Одиночки')
            content += `<div class="fragger-name ${side}"><a href="/squad/${tag}" target="_blank">${tag}</a></div>`;
          else
            content += `<div class="fragger-name ${side}">${tag}</div>`;
          content += `<div class="kill">${teamkills ? teamkills : ''}</div>`;
          content += `<div class="kill">${kills}</div></div>`;
        }

        table.innerHTML = content;
        this.squadStats.append(table);
      }
  
      for (const [name, side, desc, kills, teamkills] of topFraggers) {
        const row = document.createElement('div');
        row.className = 'fraggers-row';
        row.setAttribute('data-username', name);

        const fraggerInfo = document.createElement('div');
        fraggerInfo.className = 'fragger-info';
        fraggerInfo.innerHTML = `<div class="fragger-name"><span class="${
          side}">${name}</span><span class="fragger-desc">${desc}</span><i class="sg-caret-down"></i></div>`;
        fraggerInfo.innerHTML += `<div class="kill">${teamkills ? teamkills : ''}</div>`;
        fraggerInfo.innerHTML += `<div class="kill">${kills}</div>`;

        row.append(fraggerInfo);
        this.playerStats.append(row);
      }
    }
  
    showFrags(event) {
      const el = event.currentTarget;
      if (el.children.length > 1) {
        el.children[1].classList.toggle('none');
        return;
      }

      const victims = this.fraggers.get(el.dataset.username).victims;

      const fragsDiv = document.createElement('div');
      fragsDiv.className = 'fragger-details';
      let content = '';
      for (const [tk, unit, name, time, weapon, distance] of victims) {
        content += `<div ${unit ? 'class="human"': ''}>${tk? '<span class="tk">TK! </span>' : ''}${name}</div><div>${time
        }</div><div>${ weapon}</div><div>${distance} м.</div>`;
      }
      fragsDiv.innerHTML = content;
  
      el.append(fragsDiv);
    }
  
    setMissionEndTime() {
      this.missionEndTime.textContent = dateToTimeString(
        new Date(this.endFrame * frameCaptureDelay)
      );
    }
  
    hideEvent(event) {
      event.getElement().classList.add('none');
    }
  
    showEvent(event) {
      event.getElement().classList.remove('none');
    }

    playPause() {
      if (this.timer) { 
        this.clearTimer();
        this.playButton.querySelector("i").classList.replace('sg-pause', 'sg-play');
      } 
      else {
        if (this.frame >= this.endFrame)
          this.frame = 0;
        else
          this.setNextFrame();
        this.showFrame();
        this.setTimer();
        this.playButton.querySelector("i").classList.replace('sg-play', 'sg-pause');
      }
    }
    
    playFunction() {
      this.setNextFrame();
      this.showFrame();
      if (this.frame == this.endFrame)
        this.playPause();
    }

    setTimer() {
      this.timer = setInterval(()=> this.playFunction(), 1000 / this.playbackMultiplier);
    }

    clearTimer() {
      clearInterval(this.timer);
      this.timer = null;
    }

    drawFirelines(entity) {
      const shoots = entity.framesFired.get(this.frame);

      if (shoots) {
        const ent = entity.getLatLng(this.frame);
        if (ent) {
          for (const shoot of shoots) {
            const line = L.polyline([ent, armaToLatLng(shoot)], {
              color: entity.sideColor,
              weight: 2,
              opacity: 0.6,
            });
            line.addTo(map);
            this.firelines.push(line);
          }
        }
      }
    }

    drawKilline(event) {
      const victim = event.victim;
      const killer = event.shooter;
      if (killer == null) return;

      const victimPos = victim.getLatLng(this.frame);
      const killerPos = killer.getLatLng(this.frame);

      if (victimPos && killerPos ) {
        const line = L.polyline([victimPos, killerPos], {
          color: killer.sideColor,
          weight: 2,
          opacity: 0.6,
        });
        line.addTo(map);
        this.killines.push(line);
      }
    }

    showKill(event) {
      if (this.timer)
        this.playPause();
        
      if (this.frame !== event.frameNum) {
        this.setNextFrame(event.frameNum);
        this.showFrame();
      }
      if (window.innerHeight > window.innerWidth)
        this.rightPanel.classList.remove('right_active');
      const zoomInFor = event.shooter? event.shooter : event.victim;
      map.setView(zoomInFor.marker.getLatLng(), map.getZoom(), { animate: true });

      if (zoomInFor instanceof Unit && zoomInFor.isInVehicle)
        zoomInFor.vehicle.showPopup();
    }

    showFrame() {
      const frame = this.frame;

      this.setMissionCurTime();
  
      // Remove killines & firelines from last frame
      this.killines.forEach(line => map.removeLayer(line));
      this.firelines.forEach(line => map.removeLayer(line));

      this.killines = [];
      this.firelines = [];

      entities.getAllUnits().forEach(unit => {
        unit.manageFrame(frame);
        this.drawFirelines(unit);
      });

      entities.getAllVehicles().forEach(vehicle => vehicle.manageFrame(frame));

      // Display events for this frame (if any)
      let recentEvent;
      gameEvents.getEvents().forEach(event => {
        // Check if event is supposed to exist by this point
        if (event.frameNum <= frame) {
          if (event.frameNum === frame && event.type === 'killed')
             this.drawKilline(event);

          this.showEvent(event);
          recentEvent = event;
        } 
        else 
          this.hideEvent(event);
      });

      mineExplosionEvents.getAll().forEach(event => event.manageFrame(frame));

      groups.updateLobbyInfo();
      this.updateSideCounts();
      recentEvent?.element.scrollIntoView({block: 'end'});
    }

    setNextFrame(f=null) {
      if (f === null)
        f = this.frame + 1;

      if (f >= this.endFrame)
          f = this.endFrame;
      else if (f < 0)
        f = 0;

      this.frame = f;
    }
  }
  
  class Groups {
    constructor() {
      this._sides = {};
    }

    get sides() {return this._sides;}
  
    getGroup(groupName, side) {
      if (! (side in this.sides))
        this.sides[side] = {};
      
      if (! (groupName in this.sides[side]))
        this.sides[side][groupName] = new Group(groupName, side);

      return this.sides[side][groupName];
    }

    updateLobbyInfo() {
      for (const side in this.sides) {
        for (const gname in this.sides[side]) {
          this.sides[side][gname].manageGroup();
        }
      }
    }
  }
  
  class Group {
    constructor(name, side) {
      this._name = name;
      this._side = side;
      this._units = [];
      this._sideLobby = null; // DOM element for side lobby list
      this._element = null; // DOM element associated with this group

      this.createGroupElement();
    }
  
    get side() {return this._side;}
    get name() {return this._name;}
    get units() {return this._units;}
    get element() {return this._element;}
  
    createGroupElement() {
      switch (this.side) {
        case 'west':
          this._sideLobby = ui.listWest;
          break;
        case 'east':
          this._sideLobby = ui.listEast;
          break;
        case 'guer':
          this._sideLobby = ui.listGuer;
          break;
        case 'civ':
          this._sideLobby = ui.listCiv;
          break;
        default:
          this._sideLobby = ui.listCiv;
      }
  
      const divGroup = document.createElement('div');
      divGroup.className = 'lobby__units-group none';
      const divGroupTitle = document.createElement('div');
      divGroupTitle.className = 'lobby__units-group-title';
      divGroupTitle.textContent = this.name;
      divGroup.append(divGroupTitle);

      this._element = divGroup;
      this._sideLobby.append(this.element);
    }

    addUnit(unit) {
      this._units.push(unit);
    }

    manageGroup() {
      let show = false;
      for (const unit of this._units) {
        if (unit.isPlayer && unit.alive) {
          unit.element.classList.remove('none');
          show = true;
        }
        else
          unit.element.classList.add('none');
      }
      if (show)
        this._element.classList.remove('none');
      else
        this._element.classList.add('none');
    }
  }
  
  class GameEvents {
    constructor() {
      this._events = [];
    }
  
    addEvent(event) {
      this._events.push(event);
    }
  
    // Return an array of events that occured on the given frame
    getEventsAtFrame(f) {
      var events = [];
      this._events.forEach((event) => {
        if (event.frameNum == f) {
          events.push(event);
        }
      });
  
      return events;
    }
  
    getEvents() {
      return this._events;
    }
  }
  
  class Markers {
    constructor() {
      this._markers = [];
      this.colors = Object.freeze({
        Default: '#000',
        ColorBlack: '#000',
        ColorGrey: '#7f7f7f',
        ColorRed: '#e50000',
        ColorBrown: '#7f4000',
        ColorOrange: '#d9661a',
        ColorYellow: '#d9d900',
        ColorKhaki: '#7f9966',
        ColorGreen: '#00cc00',
        ColorBlue: '#0000ff',
        ColorPink: '#ff4d66',
        ColorWhite: '#fff',
        ColorWEST: '#004d99',
        ColorEAST: '#7f0000',
        ColorGUER: '#007f00',
        ColorCIV: '#66007f',
        ColorUNKNOWN: '#b39900',
        colorBLUFOR: '#004d99',
        colorOPFOR: '#7f0000',
        colorIndependent: '#007f00',
        colorCivilian: '#66007f',
      });
    }
  
    add(marker) {
      this._markers.push(marker);
    }
  
    getAll() {
      return this._markers;
    }
  
    armaToHexColor(color) {
      return this.colors[color];
    }
  }
  
  class Marker {
    constructor(
      name,
      text,
      type,
      position,
      size,
      color,
      brush,
      alpha,
      direction
    ) {
      this._name = name;
      this._text = text;
      this._type = type == '' ? 'boundary' : type; // Type is null if marker is used to draw the boundaries of a mission
      this._position = position;
      this._size = size;
      this._color = color;
      this._brush = brush;
      this._alpha = alpha;
      this._direction = direction;
      this._marker = null;
    }
  
    createMarker(latLng) {
      let marker = null;
      let divIcon = null;
      const type = this._type.toLowerCase();
      const markersLatLng = [
        latLng[0] * multiplier,
        imageSize - latLng[1] * multiplier,
      ];
      switch (type) {
        case 'mil_dot':
          divIcon = L.divIcon({
            className: 'marker',
            html: `<div class='marker marker-icon-${type}' style='background-color: ${markers.armaToHexColor(
              this._color
            )};'></div>`,
          });
          marker = L.marker(armaToLatLng(latLng), {
            icon: divIcon,
          }).addTo(map);
          break;
        case 'loc_bunker':
          divIcon = L.divIcon({
            className: 'marker',
            html: `<div class='marker marker-icon-${type}'></div>`,
          });
          marker = L.marker(armaToLatLng(latLng), {
            icon: divIcon,
            opacity: this._alpha,
            interactive: false,
          }).addTo(map);
          break;
        case 'rectangle':
          marker = this.rectangle(
            markersLatLng,
            convertArmaMarkerSize(this._size),
            this._direction,
            this._brush,
            this._color,
            this._alpha
          );
          break;
        case 'ellipse':
          marker = this.ellipse(
            markersLatLng,
            convertArmaMarkerSize(this._size),
            this._direction,
            this._brush,
            this._color,
            this._alpha
          );
          break;
        default:
          break;
      }
      this._marker = marker;
    }
  
    getPos() {
      return this._position;
    }
  
    rectangle(latLng, size, direction, brush, color, opacity) {
      let options = {};
      let bounds = [];
      bounds.push([latLng[0] - size[0], latLng[1] - size[1]]);
      bounds.push([latLng[0] - size[0], latLng[1] + size[1]]);
      bounds.push([latLng[0] + size[0], latLng[1] + size[1]]);
      bounds.push([latLng[0] + size[0], latLng[1] - size[1]]);
      let rotatedRect = this.rotatePoints(latLng, bounds, direction);
  
      brush = brush.toLowerCase();
      switch (brush) {
        case 'border':
          options = {
            color: markers.armaToHexColor(color),
            opacity: opacity,
            fillOpacity: 0,
            smoothFactor: 0,
            stroke: true,
            weight: 1,
            interactive: false,
          };
          break;
        case 'solidborder':
          options = {
            color: markers.armaToHexColor(color),
            fillColor: markers.armaToHexColor(color),
            opacity: 1,
            fillOpacity: 0.5 * opacity,
            smoothFactor: 0,
            stroke: true,
            weight: 1,
            interactive: false,
          };
          break;
        case 'horizontal':
        case 'vertical':
        case 'grid':
        case 'fdiagonal':
        case 'bdiagonal':
        case 'diaggrid':
        case 'cross':
          options = {
            color: 'url(#' + brush + color.toLowerCase() + ')',
            smoothFactor: 0,
            stroke: false,
            fillOpacity: opacity,
            interactive: false,
          };
          break;
        case 'solidfull':
          options = {
            fillColor: markers.armaToHexColor(color),
            fillOpacity: 1,
            smoothFactor: 0,
            noClip: false,
            stroke: false,
            interactive: false,
          };
          break;
        default:
          options = {
            fillColor: markers.armaToHexColor(color),
            fillOpacity: 0.5 * opacity,
            smoothFactor: 0,
            noClip: false,
            stroke: false,
            interactive: false,
          };
      }
      return L.polygon(rotatedRect, options).addTo(map);
    }
  
    ellipse(latLng, size, direction, brush, color, opacity) {
      let options = {};
      switch (brush) {
        case 'border':
          options = {
            color: markers.armaToHexColor(color),
            opacity: opacity,
            fillOpacity: 0,
            smoothFactor: 0,
            stroke: true,
            weight: 1,
            interactive: false,
          };
          break;
        case 'solidborder':
          options = {
            color: markers.armaToHexColor(color),
            fillColor: markers.armaToHexColor(color),
            opacity: 1,
            fillOpacity: 0.5 * opacity,
            smoothFactor: 0,
            stroke: true,
            weight: 1,
            interactive: false,
          };
          break;
        case 'horizontal':
        case 'vertical':
        case 'grid':
        case 'fdiagonal':
        case 'bdiagonal':
        case 'diaggrid':
        case 'cross':
          options = {
            color: 'url(#' + brush + color.toLowerCase() + ')',
            smoothFactor: 0,
            stroke: false,
            fillOpacity: opacity,
            interactive: false,
          };
          break;
        case 'solidfull':
          options = {
            fillColor: markers.armaToHexColor(color),
            fillOpacity: 1,
            smoothFactor: 0,
            noClip: false,
            stroke: false,
            interactive: false,
          };
          break;
        default:
          options = {
            fillColor: markers.armaToHexColor(color),
            fillOpacity: 0.5 * opacity,
            smoothFactor: 0,
            noClip: false,
            stroke: false,
            interactive: false,
          };
      }
      const radii = this.calcRadii(latLng, size);
      if (size[0] === size[1])
        return L.circle(
          map.unproject(latLng, mapMaxNativeZoom),
          radii[0],
          options
        ).addTo(map);
      // https://github.com/SlidEnergy/Leaflet.Ellipse
      else
        return L.ellipse(
          map.unproject(latLng, mapMaxNativeZoom),
          radii,
          direction,
          options
        ).addTo(map);
    }
  
    // Polygons rotation. See: https://stackoverflow.com/questions/34967607/rotate-polygon-around-point-in-leaflet-map/
    rotatePoints(center, points, dir) {
      const res = [];
      dir *= Math.PI / 180;
      for (let i = 0; i < points.length; i++) {
        let p = points[i];
        p = [p[0] - center[0], p[1] - center[1]];
        p = [
          (p = [
            Math.cos(dir) * p[0] - Math.sin(dir) * p[1],
            Math.sin(dir) * p[0] + Math.cos(dir) * p[1],
          ])[0] + center[0],
          p[1] + center[1],
        ];
        res.push(map.unproject(p, mapMaxNativeZoom));
      }
      return res;
    }
  
    // Calculate radii
    calcRadii(coords, size) {
      const latLng = map.unproject(coords, mapMaxNativeZoom); // Position of the center of the ellipse (in LatLng)
      const p1 = map.unproject(
        [coords[0] + size[0], coords[1]],
        mapMaxNativeZoom
      );
      const a = map.distance(latLng, p1); // Semi-major axis (in meters)
      const p2 = map.unproject(
        [coords[0], coords[1] + size[1]],
        mapMaxNativeZoom
      );
      const b = map.distance(latLng, p2); // Semi-minor axis (in meters)
      return [a, b];
    }
  }
  
  class HitKilledEvent {
    constructor(frameNum, type, shooter, victim, distance, weapon) {
      this.frameNum = frameNum; // Frame number that event occurred
      this.type = type; // 'hit' or 'killed'
      this.timecode = dateToTimeString(new Date(frameNum * frameCaptureDelay));
      this._element = null;
      this.shooter = shooter;
      this.victim = victim;

      this.createLogEntry(shooter, victim, distance, weapon);
    }
  
    get element() { return this._element;}
    getElement() {return this._element; }

    createLogEntry(shooter, victim, distance, weapon) {
      let shooterName;
      let victimName;
      let isVictimUnit;
      let action;

      //Process shooter info
      if (shooter instanceof Unit) {
        if (shooter.id != victim.id) {
          shooterName = shooter.getNameAtFrame(this.frameNum);
          
          switch(this.type) {
            case 'killed':
              action = ' → ';
              break;
            case 'hit':
              action = ' ранит ';
              break;
            default:
              action = ` ${this.type} `;
          }
        }
        else {
          action = ' убивает себя';
        }
      }
      else {
        action = ' умирает';
      }

      const details = [
        dateToTimeString(new Date(this.frameNum * frameCaptureDelay)),
        weapon,
        distance
      ];

      const entry = document.createElement('p');
      entry.className = 'kill-entry';

      const victimSpan = document.createElement('span');
      isVictimUnit = victim instanceof Unit;
      victimName = victim instanceof Vehicle ? victim.name : victim.getNameAtFrame(this.frameNum);
      victimSpan.className = victim.side;
      victimSpan.innerHTML = victimName;

      if (shooterName) {
        const shooterSpan = document.createElement('span');
        shooterSpan.className = shooter.side;
        shooterSpan.innerHTML = shooterName;
        entry.append(shooterSpan, action, victimSpan);
      }
      else {
        entry.append(victimSpan, action);
      }

      if (shooter instanceof Unit && shooter.id != victim.id) {
        const isTK = isVictimUnit && shooter.side === victim.side;
        ui.registerKill(
          shooterName,
          shooter.side,
          shooter._description,
          victimName,
          isVictimUnit,
          isTK,
          details
        );

        if (isTK) {
          const tkSpan = document.createElement('span');
          tkSpan.className = 'tk';
          tkSpan.innerHTML = ' TK!';
          entry.append(tkSpan);
        }
      }

      const detailsDiv = document.createElement('div');
      detailsDiv.className = 'event-details';
      detailsDiv.innerHTML = details.join(', ') + 'м';
      entry.append(detailsDiv);

      entry.addEventListener('click', () => ui.showKill(this));
      
      this._element = entry;
      ui.eventList.append(this._element);
    }
  }
  
  class ConnectEvent {
    constructor(frameNum, type, unitName, unitId) {
      this.frameNum = frameNum;
      this.type = type;
      this._element = null;

      this.createLogEntry(unitName, unitId);
    }
  
    get element() { return this._element; }
    getElement() { return this._element; }

    createLogEntry(unitName, unitId) {
      // Create list element for this event (for later use)
      const timecode = dateToTimeString(new Date(this.frameNum * frameCaptureDelay));
      const p = document.createElement('p');
      p.className = 'event-details';
      p.textContent = `${timecode} ${unitName} ${
        this.type == 'connected' ? 'подключен' : 'отключен'
      }`;
  
      this._element = p;
      ui.eventList.append(this._element);
    }
  }
  
  class MissionMessageEvent {
    constructor(frameNum, message) {
      this.frameNum = frameNum;
      this._element = null;

      this.createLogEntry(message);
    }
  
    get element() { return this._element; }
    getElement() {return this._element;}

    createLogEntry(message) {
      const p = document.createElement('p');
      p.textContent = `${dateToTimeString(new Date(this.frameNum * frameCaptureDelay))} ${message}`;

      this._element = p;
      ui.eventList.append(this._element);
    }
  }

  class MineExplosionEvent {
    constructor(frameNum, type, unitId, position) {
      this.frameNum = frameNum;
      this.type = type;
      this.unitId = unitId;
      this.position = position;
      this._marker = null;
    }

    createMarker() {
      const side = entities.getUnit(this.unitId).side;
      const latLng = armaToLatLng(this.position);

      const divIcon = L.divIcon({
        className: 'marker',
        html: `<div class='marker marker-icon-${this.type}-${side}'></div>`,
      });

      const marker = L.marker(latLng, {
        icon: divIcon,
        opacity: 0.7,
      }).addTo(map);
  
      this._marker = marker;
    }

    showMarker() {
      this._marker.getElement().classList.remove('none');
    }

    hideMarker() {
      this._marker.getElement().classList.add('none');
    }

    manageFrame(f) {
      const exists = (f - this.frameNum >= 0);
  
      if (exists)
        this.showMarker();
      else
        this.hideMarker();
    }
  }

  class MineExplosionEvents {
    constructor() {
      this._elements = [];
    }

    add(marker) {
      this._elements.push(marker);
    }
  
    getAll() {
      return this._elements;
    }
  }
  
  let imageSize = null;
  let multiplier = null;
  let trim = 0; // Number of pixels that were trimmed when cropping image (used to correct unit placement)
  let mapMinZoom = 3;
  let mapMaxNativeZoom = 6;
  let mapMaxZoom = 10;
  let map = null;
  let mapPanes = null;
  let frameCaptureDelay = 1000; // Delay between capture of each frame in-game (ms). Default: 1000
  let ui = null;
  let entities = new Entities();
  let groups = new Groups();
  let gameEvents = new GameEvents();
  let markers = new Markers();
  let mineExplosionEvents = new MineExplosionEvents();

  // Mission details
  let missionCurDate = new Date(0);
  
  $(function () {
    initOCAP();
  });
  
  async function initOCAP() {
    const fileName = document.getElementById('filename').value;
    ui = new UI();

    const worlds = maps;
    const ocap = currentOcap;
    processOp(ocap, worlds);

    let theme = decodeURIComponent(document.cookie)
      .split('; ')
      .find(c => c.startsWith('theme'))
      ?.split('=')[1];

    if (!theme) {
      theme = 'l';
      document.cookie = 'theme=l; max-age=7776000; Path=/';
    }

    if(theme === 'd')
      document.querySelector('main').classList.add('dark');

    const activeLog = ui.leftPanel.querySelector('.lobby__units-group :not(.none)').closest('.lobby__units-item');
    activeLog.classList.remove('none');

    ui.showFrame();
    ui.setTimer();
    ui.fillStats();

    $(window, '#map').keypress((event) =>
      event.charCode == 32 ? event.preventDefault() : null
    );
  }
  
  function initMap(world) {
    // Create map
    map = L.map('map', {
      maxZoom: mapMaxZoom,
      zoomControl: false,
      zoomAnimation: false,
      scrollWheelZoom: true,
      fadeAnimation: true,
      crs: L.CRS.Simple,
      attributionControl: false,
      zoomSnap: 0.1,
      zoomDelta: 1,
      closePopupOnClick: true,
    }).setView([0, 0], mapMaxNativeZoom);
  
    mapPanes = map.getPanes();
  
    imageSize = world.imageSize;
    multiplier = world.multiplier;
    map.setView(map.unproject([imageSize / 2, imageSize / 2]), mapMinZoom);
  
    const mapBounds = new L.LatLngBounds(
      map.unproject([0, imageSize], mapMaxNativeZoom),
      map.unproject([imageSize, 0], mapMaxNativeZoom)
    );
    map.fitBounds(mapBounds);
  
    // Setup tile layer
    L.tileLayer(`https://solidgames.ru/images/maps/${world.worldname}/{z}/{x}/{y}.png`, {
      maxNativeZoom: mapMaxNativeZoom,
      maxZoom: mapMaxZoom,
      minZoom: mapMinZoom,
      bounds: mapBounds,
      noWrap: true,
      tms: false,
    }).addTo(map);
  
    createInitialMarkers();
  }
  
  function createInitialMarkers() {
    // Create and set marker for unit if unit existed at game start
    entities.getAll().forEach(function (entity) {
      const latLng = entity.getLatLng(0);
      if (latLng) entity.createMarker(latLng);
    });

    markers.getAll().forEach((marker) => {
      const pos = marker.getPos();
      marker.createMarker(pos, marker); // We are not taking elevation into account.
    });

    mineExplosionEvents.getAll().forEach(exp => exp.createMarker() );
  }
  
  // Converts Arma coordinates [x,y] to LatLng
  function armaToLatLng(coords) {
    const pixelCoords = [
      coords[0] * multiplier + trim,
      imageSize - coords[1] * multiplier + trim,
    ];
    return map.unproject(pixelCoords, mapMaxNativeZoom);
  }
  
  function convertArmaMarkerSize(size) {
    return [size[0] * multiplier, size[1] * multiplier];
  }
  
  // Returns date object as little endian (day, month, year) string
  function dateToLittleEndianString(date) {
    return (
      date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear()
    );
  }
  
  function dateToTimeString(date) {
    return date.toISOString().slice(12, 19);
  }
  
  // Read operation JSON data and create unit objects
  function processOp(ocap, worlds) {
      const worldName = ocap.worldName.toLowerCase();
      frameCaptureDelay = ocap.captureDelay * 1000;

      const world = worlds.find(world => world.worldname.toLowerCase() === worldName);
  
      if (! world) {
        console.log(`Error: Map '${worldName}' is not installed`);
        return;
      }

      ui.endFrame = ocap.endFrame;
      ui.setMissionEndTime();
      ui.setMissionCurTime();
  
      //Loop through entities
      ocap.entities.forEach((entityJSON) => {
        const type = entityJSON.type;
        const startFrameNum = entityJSON.startFrameNum;
        const id = entityJSON.id;
        const name = entityJSON.name;
        const description = entityJSON.description;
        const positions = [];
  
        if (type === 'unit') {
          const side = entityJSON.side.toLowerCase();
          const isPlayer = entityJSON.isPlayer;
          const group = groups.getGroup(entityJSON.group, side);
          const framesFired = new Map();

          for (const [frame, pos] of entityJSON.framesFired) {
            if (! framesFired.has(frame))
              framesFired.set(frame, []);
            framesFired.get(frame).push(pos);
          }

          let entry = entityJSON.positions[0];
          let frameName = entry[4];
          if (! frameName) {
            frameName = name;
          }
          positions.push({
            position: entry[0],
            direction: entry[1],
            alive: entry[2],
            isInVehicle: entry[3],
            name: frameName,
            isPlayer: entry[5]
          });

          for (let i = 1; i < entityJSON.positions.length; i++) {
            const entry = entityJSON.positions[i];
            let frameName = entry[4];
            if (! frameName) {
              frameName = positions[i-1].name;
            }
            positions.push({
              position: entry[0],
              direction: entry[1],
              alive: entry[2],
              isInVehicle: entry[3],
              name: frameName,
              isPlayer: entry[5]
            });
          }
  
          // Create unit and add to entities list
          const unit = new Unit(
            startFrameNum,
            id,
            name,
            group,
            description,
            side,
            isPlayer,
            positions,
            framesFired
          );
          
          entities.addUnit(unit);
          group.addUnit(unit);
        } 
        else {
          entityJSON.positions.forEach(entry =>
            positions.push({
              position: entry[0],
              direction: entry[1],
              alive: entry[2],
              crew: entry[3],
            })
          );
          // Create vehicle and add to entities list
          const vehicle = new Vehicle(
            startFrameNum,
            id,
            entityJSON.class,
            name,
            positions
          );
          entities.addVehicle(vehicle);
        }
      });
  
      // Loop through events
      ocap.events.forEach(eventJSON => {
        const frameNum = eventJSON[0];
        const type = eventJSON[1];
  
        let gameEvent = null;
        switch (type) {
          case 'killed':
          case 'hit':
            const causedByInfo = eventJSON[3];
            const victim = entities.getById(eventJSON[2]);
            const shooter = entities.getById(causedByInfo[0]); // In older captures, this will return null
            const distance = eventJSON[4];
  
            // Create event object
            const weapon = (shooter instanceof Unit) ? causedByInfo[1] : 'N/A';

            gameEvent = new HitKilledEvent(
              frameNum,
              type,
              shooter,
              victim,
              distance,
              weapon
            );
            break;
          case 'connected':
          case 'disconnected':
            gameEvent = new ConnectEvent(
              frameNum,
              type,
              eventJSON[2],
              eventJSON[3]
            );
            break;
          case 'mission_message':
            gameEvent = new MissionMessageEvent(frameNum, eventJSON[2]);
            break;
          case 'mine_exp':
            const exp = new MineExplosionEvent(frameNum, type, eventJSON[2], eventJSON[3]);
            mineExplosionEvents.add(exp)
            break;
          default:
            console.log('Unprocessed event: ', eventJSON);
        }

        // Add event to gameEvents list
        if (gameEvent != null)
          gameEvents.addEvent(gameEvent);
      });
  
      // Loop through markers
      ocap.EditorMarkers.forEach((markersJSON) => {
        const marker = new Marker(
          markersJSON[0],
          markersJSON[1],
          markersJSON[2],
          markersJSON[3],
          markersJSON[4],
          markersJSON[5],
          markersJSON[6],
          markersJSON[7],
          markersJSON[8]
        );
        markers.add(marker);
      });
  
      initMap(world);
}

function toggleTheme() {
  const main = document.querySelector('main');
  const theme = main.classList.contains('dark') ? 'l' : 'd';
  document.cookie = `theme=${theme}; max-age=7776000; Path=/`
  main.classList.toggle('dark');
}

function goBack() {
  const url = document.referrer ? document.referrer : '/replays/';
  window.location.href = url;
}
