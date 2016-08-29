(function() {
  'use strict';
  var $, cameraSrc, element, i, len, onRobotConnection, onValueChanged, ref, refreshCamera, ui;

$ = function(selector) {
  var list;
  list = document.querySelectorAll(selector);
  if (list.length === 1) {
    return list[0];
  } else {
    return list;
  }
};

onRobotConnection = function(connected) {
  var state;
  state = connected ? 'Connected' : 'Disconnected';
  console.log(state);
  if (connected) {
    document.body.classList.add('connected');
    document.body.classList.remove('disconnected');
    refreshCamera();
  } else {
    document.body.classList.add('disconnected');
    document.body.classList.remove('connected');
  }
};

onValueChanged = function(key, value, isNew) {
  var countdown, div, input, oldInput, p, propName, s;
  if (value === 'true') {
    value = true;
  } else if (value === 'false') {
    value = false;
  }
  switch (key) {
    case '/SmartDashboard/lowerMotorSpeed':
      if (value > 100) {
        value = 100;
      } else if (value < 0) {
        value = 0;
      }
      ui.lowerMotorSpeed.value = value;
      break;
    case '/SmartDashboard/upperMotorSpeed':
      if (value > 100) {
        value = 100;
      } else if (value < 0) {
        value = 0;
      }
      ui.upperMotorSpeed.value = value;
      break;
    case '/SmartDashboard/timeRunning':
      s = 135;
      if (value) {
        ui.timer.style.color = 'black';
        countdown = setInterval((function() {
          var m, visualS;
          s--;
          m = Math.floor(s / 60);
          visualS = s % 60;
          visualS = visualS < 10 ? '0' + visualS : visualS;
          if (s < 0) {
            clearTimeout(countdown);
            return;
          } else if (s <= 15) {
            ui.timer.style.color = s % 2 === 0 ? '#FF3030' : 'transparent';
          } else if (s <= 30) {
            ui.timer.style.color = '#FF3030';
          }
          ui.timer.innerHTML = m + ':' + visualS;
        }), 1000);
      } else {
        s = 135;
      }
      NetworkTables.setValue(key, false);
  }
  propName = key.substring(16, key.length);
  if (isNew && !document.getElementsByName(propName)[0]) {
    if (key.substring(0, 16) === '/SmartDashboard/') {
      div = document.createElement('div');
      ui.tuning.list.appendChild(div);
      p = document.createElement('p');
      p.innerHTML = propName;
      div.appendChild(p);
      input = document.createElement('input');
      input.name = propName;
      input.value = value;
      if (value === true || value === false) {
        input.type = 'checkbox';
        input.checked = value;
      } else if (!isNaN(value)) {
        input.type = 'number';
      } else {
        input.type = 'text';
      }
      input.onchange = function() {
        switch (input.type) {
          case 'checkbox':
            NetworkTables.setValue(key, input.checked);
            break;
          case 'number':
            NetworkTables.setValue(key, parseInt(input.value));
            break;
          case 'text':
            NetworkTables.setValue(key, input.value);
        }
      };
      div.appendChild(input);
    }
  } else {
    oldInput = document.getElementsByName(propName)[0];
    if (oldInput) {
      if (oldInput.type === 'checkbox') {
        oldInput.checked = value;
      } else {
        oldInput.value = value;
      }
    } else {
      console.log('Error: Non-new variable ' + key + ' not present in tuning list!');
    }
  }
};

ref = $('button, .select-container, select');
for (i = 0, len = ref.length; i < len; i++) {
  element = ref[i];
  element.addEventListener('click', function() {
    return this.blur();
  });
}

ui = {
  timer: $('#timer'),
  robotState: $('#robot-state'),
  camera: $('#camera'),
  cameraRefresh: $('#camera-refresh'),
  cameraImage: $('#camera img'),
  tuning: {
    list: $('#tuning'),
    button: $('#tuning-button'),
    name: $('#name'),
    value: $('#value'),
    set: $('#set'),
    get: $('#get')
  },
  autoSelect: $('#auto-select'),
  armPosition: $('#arm-position'),
  lowerMotorSpeed: $('#lower-speed'),
  upperMotorSpeed: $('#upper-speed')
};

NetworkTables.addRobotConnectionListener(onRobotConnection, true);

NetworkTables.addGlobalListener(onValueChanged, true);

ui.tuning.button.onclick = function() {
  if (ui.tuning.list.classList.contains('hidden')) {
    return ui.tuning.list.classList.remove('hidden');
  } else {
    return ui.tuning.list.classList.add('hidden');
  }
};

ui.tuning.set.onclick = function() {
  if (ui.tuning.name.value && ui.tuning.value.value) {
    NetworkTables.setValue('/SmartDashboard/' + ui.tuning.name.value, ui.tuning.value.value);
  }
};

ui.tuning.get.onclick = function() {
  ui.tuning.value.value = NetworkTables.getValue(ui.tuning.name.value);
};

cameraSrc = ui.cameraImage.getAttribute('src');

refreshCamera = function() {
  return ui.cameraImage.setAttribute('src', cameraSrc + new Date().valueOf());
};

ui.cameraRefresh.onclick = function() {
  return refreshCamera();
};

ui.cameraImage.onerror = function() {
  return this.src = 'images/frc-field.png';
};

ui.lowerMotorSpeed.onchange = function() {
  NetworkTables.setValue('/SmartDashboard/lowerMotorSpeed', parseInt(this.value));
};

ui.upperMotorSpeed.onchange = function() {
  NetworkTables.setValue('/SmartDashboard/upperMotorSpeed', parseInt(this.value));
};

}).call(this);;
//# sourceMappingURL=app.js.map