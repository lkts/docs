/*
 * Widget allowing folks to the pick which client language they'd like to see
 * instead of "Console".
 */

import {h, Component} from "../../../../../../node_modules/preact";
import {pick, merge} from "../../../../../node_modules/ramda";
import {connect} from "../../../../../node_modules/preact-redux";
import {saveSettings} from "../actions/settings";

const alternativePrettyName = rawName => {
  switch(rawName) {
    case "csharp": return "C#";
    case "js": return "JavaScript";
    case "php": return "PHP";
    default: return rawName.charAt(0).toUpperCase() + rawName.slice(1);
  }
};

const AlternativeChoice = ({name: name, disabled: disabled}) => {
  return <option value={name} disabled={disabled}>{alternativePrettyName(name)}</option>;
};

export class _AlternativePicker extends Component {
  constructor(props) {
    super(props);
    this.state = { tooltipVisible: false };
    this.toggleWarning = this.toggleWarning.bind(this);
  }

  toggleWarning(show) {
    this.setState({ tooltipVisible: show });
  }

  render() {
    const { alternatives, consoleAlternative, saveSettings } = this.props;

    if (!alternatives) {
      return <div />;
    }

    const consoleAlternatives = alternatives.console;
    if (!consoleAlternatives) {
      return <div/>;
    }

    const items = [];
    let sawChoice = 'console' === consoleAlternative;
    items.push(<AlternativeChoice name='console'/>);
    for (const name of Object.keys(consoleAlternatives)) {
      sawChoice |= name === consoleAlternative;
      let disabled = this.props.langs ? !this.props.langs.includes(name) : false;
      items.push(<AlternativeChoice name={name} disabled={disabled} />);
    }

    /* If value isn't in the list then *make* it and we'll render our standard
     * "there no example for this language" option. This prevents us from
     * squashing preferences that users set. */
    if (!sawChoice) {
      items.push(<AlternativeChoice name={consoleAlternative} />);
    }
    // TODO we shouldn't change these drop downs after the first time they are rendered. The extra choice should stay while you stay on the page. Maybe we can get away with rendering this once on page load and never subscribing again?

    return <div className="AlternativePicker u-space-between">
      <select className="AlternativePicker-select"
              value={consoleAlternative}
              onChange={(e) => {
                saveSettings({
                  consoleAlternative: e.target.value,
                  alternativeChangeSource: e.target,
                });
              }}>
        {items}
      </select>
      <div
        className="AlternativePicker-warning"
        onMouseOver={() => this.toggleWarning(true)}
        onMouseOut={() => this.toggleWarning(false)} />

      { this.state.tooltipVisible
          ? (
            <div className="AlternativePicker-tooltip-wrapper">
              <div className="AlternativePicker-tooltip" role="tooltip">
                <div className="arrow"></div>
                <div>No {alternativePrettyName(consoleAlternative)} version available for this example</div>
              </div>
            </div>
          ) : null }
    </div>;
  }
}

export default connect(
  state => merge(
    pick(["consoleAlternative"], state.settings),
      {alternatives: state.alternatives}),
  {saveSettings})(_AlternativePicker);
