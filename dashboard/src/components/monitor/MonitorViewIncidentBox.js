import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import IncidentList from '../incident/IncidentList';
import { fetchMonitorsIncidents } from '../../actions/monitor';
import ShouldRender from '../basic/ShouldRender';
import { FormLoader } from '../basic/Loader';
import DataPathHoC from '../DataPathHoC';
import uuid from 'uuid';
import { openModal, closeModal } from '../../actions/modal';
import { createNewIncident } from '../../actions/incident';
import CreateManualIncident from '../modals/CreateManualIncident';
import { logEvent } from '../../analytics';
import { SHOULD_LOG_ANALYTICS } from '../../config';
import Dropdown, { MenuItem } from '@trendmicro/react-dropdown';

export class MonitorViewIncidentBox extends Component {
    constructor(props) {
        super(props);
        this.state = {
            createIncidentModalId: uuid.v4(),
            incidents: {},
            filteredIncidents: [],
        };
    }

    componentDidMount() {
        const { monitor } = this.props;
        this.setState(() => ({ incidents: monitor }));
    }

    prevClicked = () => {
        this.props.fetchMonitorsIncidents(
            this.props.monitor.projectId._id,
            this.props.monitor._id,
            this.props.monitor.skip
                ? parseInt(this.props.monitor.skip, 10) - 5
                : 5,
            5
        );
        if (SHOULD_LOG_ANALYTICS) {
            logEvent(
                'EVENT: DASHBOARD > PROJECT > COMPONENT > MONITOR > PREVIOUS INCIDENT CLICKED',
                {
                    projectId: this.props.monitor.projectId._id,
                }
            );
        }
    };

    nextClicked = () => {
        this.props.fetchMonitorsIncidents(
            this.props.monitor.projectId._id,
            this.props.monitor._id,
            this.props.monitor.skip
                ? parseInt(this.props.monitor.skip, 10) + 5
                : 5,
            5
        );
        if (SHOULD_LOG_ANALYTICS) {
            logEvent(
                'EVENT: DASHBOARD > PROJECT > COMPONENT > MONITOR > NEXT INCIDENT CLICKED',
                {
                    projectId: this.props.monitor.projectId._id,
                }
            );
        }
    };

    handleKeyBoard = e => {
        switch (e.key) {
            case 'Escape':
                return this.props.closeModal({
                    id: this.state.createIncidentModalId,
                });
            default:
                return false;
        }
    };

    filterIncidentLogs = status => {
        const filteredIncidents =
            this.state.incidents.length > 0
                ? this.state.incidents.filter(incident => !incident[status])
                : [];
    };

    render() {
        const { createIncidentModalId, incidents } = this.state;
        const creating = this.props.create ? this.props.create : false;

        return (
            <div
                onKeyDown={this.handleKeyBoard}
                className="bs-ContentSection Card-root Card-shadow--medium"
            >
                <div className="ContentHeader Box-root Box-background--white Box-divider--surface-bottom-1 Flex-flex Flex-direction--column Padding-horizontal--20 Padding-vertical--16">
                    <div className="Box-root Flex-flex Flex-direction--row Flex-justifyContent--spaceBetween">
                        <div className="ContentHeader-center Box-root Flex-flex Flex-direction--column Flex-justifyContent--center">
                            <span className="ContentHeader-title Text-color--inherit Text-display--inline Text-fontSize--16 Text-fontWeight--medium Text-lineHeight--28 Text-typeface--base Text-wrap--wrap">
                                <span>Incident Log</span>
                            </span>
                            <span className="ContentHeader-description Text-color--inherit Text-display--inline Text-fontSize--14 Text-fontWeight--regular Text-lineHeight--20 Text-typeface--base Text-wrap--wrap">
                                <span>
                                    Here&#39;s a log of all of your incidents
                                    created for this monitor.
                                </span>
                            </span>
                        </div>
                        <div className="ContentHeader-end Box-root Flex-flex Flex-alignItems--center Margin-left--16">
                            <span className="Margin-right--8">
                                <Dropdown
                                // disabled={updating}
                                >
                                    <Dropdown.Toggle
                                        // id={`changeRole_${this.props.email}`}
                                        title="Filter By"
                                        className="bs-Button bs-DeprecatedButton"
                                    />
                                    <Dropdown.Menu>
                                        <MenuItem
                                            title="Acknowledged"
                                            onClick={() =>
                                                this.filterIncidentLogs(
                                                    'acknowledged'
                                                )
                                            }
                                        >
                                            Unacknowledged
                                        </MenuItem>
                                        <MenuItem
                                            title="Resolved"
                                            onClick={() =>
                                                this.filterIncidentLogs(
                                                    'resolved'
                                                )
                                            }
                                        >
                                            Unresolved
                                        </MenuItem>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </span>
                            <button
                                className={
                                    creating
                                        ? 'bs-Button bs-Button--blue'
                                        : 'bs-Button bs-ButtonLegacy ActionIconParent'
                                }
                                type="button"
                                disabled={creating}
                                id={`createIncident_${this.props.monitor.name}`}
                                onClick={() =>
                                    this.props.openModal({
                                        id: createIncidentModalId,
                                        content: DataPathHoC(
                                            CreateManualIncident,
                                            {
                                                monitorId: this.props.monitor
                                                    ._id,
                                                projectId: this.props.monitor
                                                    .projectId._id,
                                            }
                                        ),
                                    })
                                }
                            >
                                <ShouldRender if={!creating}>
                                    <span className="bs-FileUploadButton bs-Button--icon bs-Button--new">
                                        <span>Create New Incident</span>
                                    </span>
                                </ShouldRender>
                                <ShouldRender if={creating}>
                                    <FormLoader />
                                </ShouldRender>
                            </button>
                        </div>
                    </div>
                </div>
                <div className="bs-ContentSection Card-root Card-shadow--medium">
                    <IncidentList
                        componentId={this.props.componentId}
                        incidents={incidents}
                        prevClicked={this.prevClicked}
                        nextClicked={this.nextClicked}
                    />
                </div>
            </div>
        );
    }
}

MonitorViewIncidentBox.displayName = 'MonitorViewIncidentBox';

MonitorViewIncidentBox.propTypes = {
    componentId: PropTypes.string.isRequired,
    monitor: PropTypes.object.isRequired,
    fetchMonitorsIncidents: PropTypes.func.isRequired,
    openModal: PropTypes.func,
    create: PropTypes.bool,
    closeModal: PropTypes.func,
};

const mapDispatchToProps = dispatch =>
    bindActionCreators(
        { fetchMonitorsIncidents, openModal, closeModal, createNewIncident },
        dispatch
    );

const mapStateToProps = state => {
    return {
        currentProject: state.project.currentProject,
        create: state.incident.newIncident.requesting,
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(MonitorViewIncidentBox);
