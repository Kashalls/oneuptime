import React, { useState, useRef, useEffect } from 'react';
import { connect } from 'react-redux';

import { formValueSelector } from 'redux-form';
import PropTypes from 'prop-types';
import Select from './Select';

const errorStyle: $TSFixMe = {
    color: 'red',
    topMargin: '5px',
};

interface TeamMemberSelectorProps {
    id?: string;
    input: object;
    placeholder?: string;
    meta: object;
    subProjectTeam?: unknown[];
    policyIndex: number;
    form: object;
    teamIndex: number;
    projectGroups?: object;
    renderType?: string;
}

const TeamMemberSelector: Function = ({
    id,
    input,
    placeholder,
    meta: { touched, error },
    subProjectTeam,
    form,
    policyIndex,
    teamIndex,
    projectGroups,
    renderType
}: TeamMemberSelectorProps) => {
    const allowedTeamMembers: $TSFixMe = makeAllowedTeamMembers(
        form[policyIndex].teams[teamIndex].teamMembers,
        subProjectTeam
    );
    const groups: $TSFixMe =
        (projectGroups.groups &&
            projectGroups.groups.map((group: $TSFixMe) => {
                return {
                    value: group._id,
                    label: group.name,
                };
            })) ||
        [];
    const allowedGroups: $TSFixMe = makeAllowedGroups(
        projectGroups.groups && projectGroups.groups,
        form[policyIndex].teams[teamIndex].teamMembers
    );

    const allowedOptionsForDropdown: $TSFixMe =
        renderType === 'team'
            ? [
                {
                    value: '',
                    label:
                        allowedTeamMembers.length === 0
                            ? 'No team member available'
                            : 'Select Team Member...',
                },
            ].concat(

                allowedTeamMembers.map(member => {
                    return {
                        value: member.userId,
                        label: member.name ? member.name : member.email,
                        show: member.role !== 'Viewer',
                    };
                })
            )
            : [
                {
                    value: '',
                    label:
                        allowedGroups.length === 0
                            ? 'No group available'
                            : 'Select Group...',
                },
            ].concat(
                allowedGroups.map(group => {
                    return {

                        value: group._id,

                        label: group.name,
                    };
                })
            );

    const options: $TSFixMe =
        renderType === 'team'
            ? [{ value: '', label: 'Select Team Member...' }].concat(
                subProjectTeam.map((member: $TSFixMe) => {
                    return {
                        value: member.userId,
                        label: member.name ? member.name : member.email,
                        show: member.role !== 'Viewer',
                    };
                })
            )
            : [{ value: '', label: 'Select Group...' }].concat(groups);

    const filteredOpt: $TSFixMe = useRef();

    filteredOpt.current = options.filter(opt => opt.value === input.value);

    const [value, setValue]: $TSFixMe = useState({
        value: input.value,
        label:

            filteredOpt.current.length > 0

                ? filteredOpt.current[0].label
                : placeholder,
    });

    useEffect(() => {
        setValue({
            value: input.value,
            label:

                filteredOpt.current.length > 0

                    ? filteredOpt.current[0].label
                    : placeholder,
        });
    }, [input, placeholder]);

    const handleChange: Function = (option: $TSFixMe) => {
        setValue(option);
        if (input.onChange) {
            input.onChange(option.value);
        }
    };

    return (
        <span>
            <div style={{ height: '28px' }}>
                <Select

                    id={id}
                    name={input.name}
                    value={value}
                    onChange={handleChange}
                    className="db-select-nw"
                    options={allowedOptionsForDropdown.filter(opt =>

                        opt.show !== undefined ? opt.show : true
                    )}
                />
            </div>
            {touched && error && (
                <div
                    className="Box-root Flex-flex Flex-alignItems--stretch Flex-direction--row Flex-justifyContent--flexStart"
                    style={{ marginTop: '5px' }}
                >
                    <div
                        className="Box-root Margin-right--8"
                        style={{ marginTop: '2px' }}
                    >
                        <div className="Icon Icon--info Icon--color--red Icon--size--14 Box-root Flex-flex"></div>
                    </div>
                    <div className="Box-root">
                        <span style={errorStyle}>{error}</span>
                    </div>
                </div>
            )}
        </span>
    );
};

TeamMemberSelector.displayName = 'TeamMemberSelector';

TeamMemberSelector.propTypes = {
    id: PropTypes.string,
    input: PropTypes.object.isRequired,
    placeholder: PropTypes.string,
    meta: PropTypes.object.isRequired,
    subProjectTeam: PropTypes.array,
    policyIndex: PropTypes.number.isRequired,
    form: PropTypes.object.isRequired,
    teamIndex: PropTypes.number.isRequired,
    projectGroups: PropTypes.object,
    renderType: PropTypes.string,
};

function makeAllowedTeamMembers(teamMembers = [], subProjectTeam = []) {

    const validTeamMembers = teamMembers.filter(member: $TSFixMe => member.userId);
    if (validTeamMembers.length === 0) return subProjectTeam;

    const memberMap: $TSFixMe = new Map();
    const allowedTeamMembers: $TSFixMe = [];
    validTeamMembers.forEach(member => {

        memberMap.set(member.userId, member);
    });
    const memberArray: $TSFixMe = Array.from(memberMap.keys());
    subProjectTeam.forEach(TM => {

        if (!memberArray.includes(TM.userId)) allowedTeamMembers.push(TM);
    });

    return allowedTeamMembers;
}

function makeAllowedGroups(groups = [], projectGroups = []) {

    const validGroup = projectGroups.filter(group: $TSFixMe => group.groupId);
    if (validGroup.length === 0) return groups;
    const filteredGroups: $TSFixMe = groups.filter(

        group => !validGroup.some(grp => grp.groupId === group._id)
    );
    return filteredGroups;
}

function mapStateToProps(state: RootState, props: $TSFixMe) {
    const selector: $TSFixMe = formValueSelector('OnCallAlertBox');
    const form: $TSFixMe = selector(state, 'OnCallAlertBox');
    const subProjectTeams: $TSFixMe = state.team.subProjectTeamMembers;
    const subProjectTeam: $TSFixMe =
        subProjectTeams.find((team: $TSFixMe) => team._id === props.subProjectId) || {};

    return {
        subProjectTeam: subProjectTeam.teamMembers || [],
        form,
        projectGroups: state.groups.oncallDuty,
    };
}

export default connect(mapStateToProps)(TeamMemberSelector);