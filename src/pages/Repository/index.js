import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import {
    Loading,
    Owner,
    IssueList,
    FilterOption,
    WrapperButton,
} from './styles';
import api from '../../services/api';
import Container from '../../components/Container';

const propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            repository: PropTypes.string,
        }),
    }).isRequired,
};
class Repository extends Component {
    state = {
        repository: {},
        issues: [],
        loading: true,
        page: 1,
        filter: 'open',
    };

    async componentDidMount() {
        this.loadIssues();
    }

    loadIssues = async () => {
        const { match } = this.props;
        const { filter, page } = this.state;
        const repoName = decodeURIComponent(match.params.repository);

        const [repository, issues] = await Promise.all([
            api.get(`/repos/${repoName}`),
            api.get(`/repos/${repoName}/issues`, {
                params: {
                    state: filter,
                    page,
                    per_page: 5,
                },
            }),
        ]);
        this.setState({
            repository: repository.data,
            issues: issues.data,
            loading: false,
        });
    };

    handleRadioChange = async e => {
        await this.setState({ filter: e.target.value });
        await this.loadIssues();
    };

    handleButtonNext = async () => {
        let { page } = this.state;

        page++;
        await this.setState({ page });
        await this.loadIssues();
    };

    handleButtonReturn = async () => {
        let { page } = this.state;
        page--;
        await this.setState({ page });
        await this.loadIssues();
    };

    render() {
        const { repository, issues, loading } = this.state;
        let { page } = this.state;
        if (page === 1) {
            page = 0;
        }

        if (loading) {
            return <Loading>Carregando...</Loading>;
        }
        return (
            <Container>
                <WrapperButton>
                    <button
                        onClick={this.handleButtonReturn}
                        defaultValue="Voltar"
                        disabled={!page}
                        type="button"
                    >
                        Voltar
                    </button>
                    <button onClick={this.handleButtonNext} type="button">
                        Avançar
                    </button>
                </WrapperButton>
                <Owner>
                    <Link to="/"> Voltar aos Repositórios</Link>
                    <img
                        src={repository.owner.avatar_url}
                        alt={repository.owner.login}
                    />
                    <h1>{repository.name}</h1>
                    <p>{repository.description}</p>
                </Owner>
                <FilterOption>
                    <label>
                        <input
                            name="filter"
                            onChange={this.handleRadioChange}
                            value="open"
                            type="radio"
                        />
                        Open
                    </label>
                    <label>
                        <input
                            onChange={this.handleRadioChange}
                            value="all"
                            name="filter"
                            type="radio"
                        />
                        All
                    </label>
                    <label>
                        <input
                            onChange={this.handleRadioChange}
                            value="closed"
                            name="filter"
                            type="radio"
                        />
                        Closed
                    </label>
                </FilterOption>
                <IssueList>
                    {issues.map(issue => (
                        <li key={String(issue.id)}>
                            <img
                                src={issue.user.avatar_url}
                                alt={issue.user.login}
                            />
                            <div>
                                <strong>
                                    <a href={issue.html_url}>{issue.title} </a>
                                    {issue.labels.map(label => (
                                        <span key={String(label.id)}>
                                            {label.name}
                                        </span>
                                    ))}
                                </strong>
                                <p>{issue.user.login}</p>
                            </div>
                        </li>
                    ))}
                </IssueList>
            </Container>
        );
    }
}
Repository.propTypes = propTypes;

export default Repository;
