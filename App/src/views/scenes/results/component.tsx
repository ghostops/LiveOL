import * as React from 'react';
import _ from 'lodash';
import { LayoutAnimation } from 'react-native';
import { OLRefetcher } from 'views/components/refetcher';
import { OLResultsList } from 'views/components/result/list';
import { OLResultsTable } from 'views/components/result/table';
import { Result } from 'lib/graphql/fragments/types/Result';

interface Props {
	refetch: () => Promise<void>;
	results: Result[];
	landscape: boolean;
	focus: boolean;

	competitionId: number;
	className: string;
}

interface State {
	landscape: boolean;

	showTable: boolean;
	showList: boolean;
}

export class OLResults extends React.PureComponent<Props, State> {
	state: State = {
		landscape: this.props.landscape,

		showList: !this.props.landscape,
		showTable: this.props.landscape,
	};

	showComponent = (c: 'table' | 'list') => {
		if (!this.props.focus) return;

		const a = c === 'table' ? 'showList' : 'showTable';
		const b = c === 'table' ? 'showTable' : 'showList';

		LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

		this.setState({ [a]: false } as any, () => {
			_.defer(() => {
				LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
				this.setState({ [b]: true } as any);
			});
		});
	};

	componentDidUpdate() {
		if (this.props.landscape !== this.state.landscape) {
			this.setState({ landscape: this.props.landscape }, () => {
				if (this.props.landscape) {
					this.showComponent('table');
				} else {
					this.showComponent('list');
				}
			});
		}
	}

	render() {
		const { className, competitionId, results, refetch } = this.props;

		return (
			<>
				{this.props.focus && <OLRefetcher interval={15000} refetch={refetch} />}

				{
					// LANDSCAPE
					this.state.showTable && (
						<OLResultsTable
							results={results}
							competitionId={competitionId}
							className={className}
							disabled={!this.props.focus}
						/>
					)
				}

				{
					// PORTRAIT
					this.state.showList && (
						<OLResultsList
							results={results}
							competitionId={competitionId}
							className={className}
							disabled={!this.props.focus}
						/>
					)
				}
			</>
		);
	}
}
