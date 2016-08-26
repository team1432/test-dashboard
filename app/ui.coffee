$ = (selector) ->
  list = document.querySelectorAll(selector)
  if list.length is 1
    list[0]
  else
    list

onRobotConnection = (connected) ->
  state = if connected then 'Connected' else 'Disconnected'
  console.log state
  ui.robotState.innerHTML = state
  ui.robotState.classList.add state.toLowerCase()
  return

onValueChanged = (key, value, isNew) ->
  # Sometimes, NetworkTables will pass booleans as strings. This corrects for that.
  if value is 'true'
    value = true
  else if value is 'false'
    value = false
  # This switch statement chooses which UI element to update when a NetworkTables variable changes
  switch key
    when '/SmartDashboard/lowerMotorSpeed'
      if value > 100
        value = 100
      else if value < 0
        value = 0
      ui.lowerMotorSpeed.value = value
    when '/SmartDashboard/upperMotorSpeed'
      if value > 100
        value = 100
      else if value < 0
        value = 0
      ui.upperMotorSpeed.value = value
    when '/SmartDashboard/timeRunning'
      # When this NetworkTables variable is true, the timer will start.
      # You shouldn't need to touch this code, but it's documented anyway in case you do.
      s = 135
      if value
        # Make sure timer is reset to black when it starts
        ui.timer.style.color = 'black'
        # Function below adjusts time left every second
        countdown = setInterval((->
          s--
          # Subtract one second
          # Minutes (m) is equal to the total seconds divided by sixty with the decimal removed.
          m = Math.floor(s / 60)
          # Create seconds number that will actually be displayed after minutes are subtracted
          visualS = s % 60
          # Add leading zero if seconds is one digit long, for proper time formatting.
          visualS = if visualS < 10 then '0' + visualS else visualS
          if s < 0
            # Stop countdown when timer reaches zero
            clearTimeout countdown
            return
          else if s <= 15
            # Flash timer if less than 15 seconds left
            ui.timer.style.color = if s % 2 is 0 then '#FF3030' else 'transparent'
          else if s <= 30
            # Solid red timer when less than 30 seconds left.
            ui.timer.style.color = '#FF3030'
          ui.timer.innerHTML = m + ':' + visualS
          return
        ), 1000)
      else
        s = 135
      NetworkTables.setValue key, false

  # The following code manages tuning section of the interface.
  # This section displays a list of all NetworkTables variables (that start with /SmartDashboard/) and allows you to directly manipulate them.
  propName = key.substring(16, key.length)
  # Check if value is new and doesn't have a spot on the list yet
  if isNew and !document.getElementsByName(propName)[0]
    # Make sure name starts with /SmartDashboard/. Properties that don't are technical and don't need to be shown on the list.
    if key.substring(0, 16) is '/SmartDashboard/'
      # Make a new div for this value
      div = document.createElement('div')
      # Make div
      ui.tuning.list.appendChild div
      # Add the div to the page
      p = document.createElement('p')
      # Make a <p> to display the name of the property
      p.innerHTML = propName
      # Make content of <p> have the name of the NetworkTables value
      div.appendChild p
      # Put <p> in div
      input = document.createElement('input')
      # Create input
      input.name = propName
      # Make its name property be the name of the NetworkTables value
      input.value = value
      # Set
      # The following statement figures out which data type the variable is.
      # If it's a boolean, it will make the input be a checkbox. If it's a number,
      # it will make it a number chooser with up and down arrows in the box. Otherwise, it will make it a textbox.
      if value is true or value is false
        # Is it a boolean value?
        input.type = 'checkbox'
        input.checked = value
        # value property doesn't work on checkboxes, we'll need to use the checked property instead
      else if !isNaN(value)
        # Is the value not not a number? Great!
        input.type = 'number'
      else
        # Just use a text if there's no better manipulation method
        input.type = 'text'
      # Create listener for value of input being modified

      input.onchange = ->
        switch input.type
          # Figure out how to pass data based on data type
          when 'checkbox'
            # For booleans, send bool of whether or not checkbox is checked
            NetworkTables.setValue key, input.checked
          when 'number'
            # For number values, send value of input as an int.
            NetworkTables.setValue key, parseInt(input.value)
          when 'text'
            # For normal text values, just send the value.
            NetworkTables.setValue key, input.value
        return

      # Put the input into the div.
      div.appendChild input
  else
    # If the value is not new
    # Find already-existing input for changing this variable
    oldInput = document.getElementsByName(propName)[0]
    if oldInput
      # If there is one (there should be, unless something is wrong)
      if oldInput.type is 'checkbox'
        # Figure out what data type it is and update it in the list
        oldInput.checked = value
      else
        oldInput.value = value
    else
      console.log 'Error: Non-new variable ' + key + ' not present in tuning list!'
  return

for element in $('button, .select-container, select')
  element.addEventListener 'click', ->
    @blur()

# Define UI elements
ui = 
  timer: $('#timer')
  robotState: $('#robot-state')
  tuning:
    list: $('#tuning')
    button: $('#tuning-button')
    name: $('#name')
    value: $('#value')
    set: $('#set')
    get: $('#get')
  autoSelect: $('#auto-select')
  armPosition: $('#arm-position')
  lowerMotorSpeed: $('#lower-speed')
  upperMotorSpeed: $('#upper-speed')
# Sets function to be called on NetworkTables connect. Commented out because it's usually not necessary.
# NetworkTables.addWsConnectionListener(onNetworkTablesConnection, true);
# Sets function to be called when robot dis/connects
NetworkTables.addRobotConnectionListener onRobotConnection, true
# Sets function to be called when any NetworkTables key/value changes
NetworkTables.addGlobalListener onValueChanged, true
# Open tuning section when button is clicked

ui.tuning.button.onclick = ->
  if ui.tuning.list.classList.contains 'hidden'
    ui.tuning.list.classList.remove 'hidden'
  else
    ui.tuning.list.classList.add 'hidden'

# Manages get and set buttons at the top of the tuning pane

ui.tuning.set.onclick = ->
  # Make sure the inputs have content, if they do update the NT value
  if ui.tuning.name.value and ui.tuning.value.value
    NetworkTables.setValue '/SmartDashboard/' + ui.tuning.name.value, ui.tuning.value.value
  return

ui.tuning.get.onclick = ->
  ui.tuning.value.value = NetworkTables.getValue(ui.tuning.name.value)
  return

# Get value of speed slider when it's adjusted

ui.lowerMotorSpeed.onchange = ->
  NetworkTables.setValue '/SmartDashboard/lowerMotorSpeed', parseInt(@value)
  return

# Get value of speed slider when it's adjusted

ui.upperMotorSpeed.onchange = ->
  NetworkTables.setValue '/SmartDashboard/upperMotorSpeed', parseInt(@value)
  return
