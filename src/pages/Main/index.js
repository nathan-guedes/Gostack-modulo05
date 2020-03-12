import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { FaGithubAlt, FaPlus, FaSpinner } from 'react-icons/fa';
import { Form, SubmitButton, List } from './styles';
import Container from '../../components/Container';

import api from '../../services/api';

export default class Main extends Component {
    state = {
        newRepo: '',
        repositories: [],
        loading: false,
        err: false,
    };

    componentDidMount() {
        const repositories = localStorage.getItem('repositories');
        if (repositories) {
            this.setState({ repositories: JSON.parse(repositories) });
        }
    }

    componentDidUpdate(_, prevState) {
        const { repositories } = this.state;
        if (prevState.repositories !== repositories) {
            localStorage.setItem('repositories', JSON.stringify(repositories));
        }
    }

    handleInputChange = e => {
        this.setState({ newRepo: e.target.value });
    };

    handleSubmit = async e => {
        e.preventDefault();
        this.setState({ loading: true });
        const { newRepo, repositories } = this.state;
        try {
            const searchInState = repositories.find(
                repos => repos.name === newRepo
            );
            if (searchInState) {
                throw new Error('Repositório duplicado');
            }
            const response = await api.get(`/repos/${newRepo}`);
            const data = {
                name: response.data.full_name,
            };
            this.setState({
                repositories: [...repositories, data],
                newRepo: '',
                loading: false,
                err: false,
            });
        } catch (err) {
            this.setState({
                loading: false,
                newRepo: '',
                err: true,
            });
        }
    };

    render() {
        const { newRepo, loading, repositories, err } = this.state;

        return (
            <Container>
                <h1>
                    <FaGithubAlt />
                    Repositorios
                </h1>
                <Form onSubmit={this.handleSubmit} err={err ? 1 : 0}>
                    <input
                        type="text"
                        placeholder="Adicionar Repositorio"
                        value={newRepo}
                        onChange={this.handleInputChange}
                    />
                    <SubmitButton loading={loading ? 1 : 0}>
                        {loading ? (
                            <FaSpinner color="#FFF" size={14} />
                        ) : (
                            <FaPlus color="#FFF" size={14} />
                        )}
                    </SubmitButton>
                </Form>
                <List>
                    {repositories.map(repos => (
                        <li key={repos.name}>
                            <span>{repos.name}</span>

                            <Link
                                to={`/repository/${encodeURIComponent(
                                    repos.name
                                )}`}
                            >
                                Detalhes{' '}
                            </Link>
                        </li>
                    ))}
                </List>
            </Container>
        );
    }
}
