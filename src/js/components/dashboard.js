import React, { Component } from 'react'
import ReactSVG from 'react-svg'
import { connect } from 'react-redux'
import moment from 'moment-timezone'
import { Link } from 'react-router-dom'
import compact from 'lodash/compact'
import get from 'lodash/get'
import { RadialChart } from 'react-vis'
import countBy from 'lodash/countBy'
import filter from 'lodash/filter'
import { withRouter } from 'react-router'
import T from 'i18n-react'
import ReactTooltip from 'react-tooltip'

import { setLocale } from '../actions/translate-actions'
import { openAbout } from '../actions/about-actions'
import { Measures } from './measure'
import LastUpdated from './last-updated'
import ProgressMeter from './progress-meter'
import Subscribe from './subscribe'
import ToggleSwitch from './toggle-switch'

import '../../scss/dashboard.css'

const END_OF_TERM = '2022-05-13'
const START_OF_TERM = '2017-05-14'

const rootPath = process.env.REACT_APP_ROOT_PATH || '' // for access assets when running on a nested path, i.e. github pages
const MAILCHIMP_ACTION = process.env.REACT_APP_MAILCHIMP_ACTION
const FORM_PROPS = {
    messages: {
        inputPlaceholder: {
            fr: 'Entrez votre e-mail',
            en: 'Enter your e-mail',
        },
        btnLabel: {
            fr: "S'inscrire",
            en: 'Subscribe',
        },
        sending: {
            fr: 'En cours...',
            en: 'Sending...',
        },
        missingEmail: {
            fr: 'Entrez votre e-mail ci-dessus !',
            en: 'Enter your e-mail address!',
        },
        invalidEmail: {
            fr: 'Votre e-mail doit être valide.',
            en: 'Your email is not valid.',
        },
    },
    action: MAILCHIMP_ACTION,
}

const DashboardRow = ({ children }) => (
    <div className="dashboard-row">{children}</div>
)

const DashboardBox = ({ children, className, full }) => (
    <div
        className={`dashboard-box ${className || ''} ${
            full ? 'dashboard-box--full' : ''
        }`}
    >
        {children}
    </div>
)

const DashboardHeader = ({ locale, openAbout }) => (
    <div className="dashboard-header">
        <div className="dashboard-image" />
    </div>
)

const DashboardBody = ({ children }) => (
    <div className="dashboard-body">{children}</div>
)

const DashboardTimer = ({ total, current, locale }) => (
    <div className="dashboard-timer">
        <ProgressMeter
            reverse
            total={total}
            current={current}
            locale={locale}
            className="timeline"
        >
            <div className="dashboard-timer__left">
                Suivez la <span>mise en oeuvre</span> du programme
            </div>
            <div className="dashboard-timer__right">
                <span>
                    {current} {current === 1 ? 'jour' : 'jours'}
                </span>{' '}
                restants
            </div>
        </ProgressMeter>
    </div>
)

const PieChartLegend = ({ children, color }) => (
    <div className="pie-chart__legend-item">
        <div className="pie-chart__legend-circle" style={{ color }} />
        {children}
    </div>
)

class PieChart extends Component {
    state = {
        value: false,
        majorOnly: true,
    }

    generateData(measures, locale) {
        return [
            {
                angle: measures['DONE'],
                label: T.translate('measures.statuses', {
                    context: `${locale}.DONE`,
                }),
                style: { fill: '#2bca9e', stroke: 'none' },
            },
            {
                angle: measures['IN_PROGRESS'],
                label: T.translate('measures.statuses', {
                    context: `${locale}.IN_PROGRESS`,
                }),
                style: { fill: '#00bef9', stroke: 'none' },
            },
            {
                angle: measures['UPCOMING'],
                label: T.translate('measures.stauses', {
                    context: `${locale}.UPCOMING`,
                }),
                style: { fill: '#dedede', stroke: 'none' },
            },
        ]
    }

    render() {
        let { measures, locale, presidentialManifesto } = this.props
        let { majorOnly } = this.state
        if (majorOnly) {
            measures = filter(measures, 'major')
        }
        measures = filter(measures, ['manifestoId', presidentialManifesto.id])
        measures = countBy(measures, 'status')
        return (
            <div className="pie-chart">
                <RadialChart
                    animation
                    className="pie-chart__chart"
                    innerRadius={40}
                    radius={64}
                    data={this.generateData(measures, locale)}
                    width={132}
                    height={132}
                />

                <div className="pie-chart__legend">
                    <PieChartLegend color={'#2bca9e'}>
                        <span className="pie-chart__legend-label">
                            {T.translate('dashboard.measureDone', {
                                context: locale,
                            })}
                        </span>
                        {measures['DONE']}{' '}
                        {T.translate('dashboard.measure', { context: locale })}s
                    </PieChartLegend>
                    <PieChartLegend color={'#00bef9'}>
                        <span className="pie-chart__legend-label">
                            {T.translate('dashboard.measureInProgress', {
                                context: locale,
                            })}
                        </span>
                        {measures['IN_PROGRESS']}{' '}
                        {T.translate('dashboard.measure', { context: locale })}s
                    </PieChartLegend>
                    <PieChartLegend color={'#dedede'}>
                        <span className="pie-chart__legend-label">
                            {T.translate('dashboard.measureUpcoming', {
                                context: locale,
                            })}
                        </span>
                        {measures['UPCOMING']}{' '}
                        {T.translate('dashboard.measure', { context: locale })}s
                    </PieChartLegend>
                </div>

                <div className="pie-chart__footer">
                    <ToggleSwitch
                        initialChecked={true}
                        onChange={() =>
                            this.setState({ majorOnly: !majorOnly })
                        }
                    >
                        {T.translate('dashboard.majorText', {
                            context: locale,
                        })}
                    </ToggleSwitch>
                </div>
            </div>
        )
    }
}

class Dashboard extends Component {
    state = {
        totalDaysInTerm: moment(END_OF_TERM).diff(
            moment(START_OF_TERM),
            'days'
        ),
        daysRemainingInTerm: moment(END_OF_TERM).diff(moment(), 'days'),
    }

    componentWillReceiveProps(nextProps) {
        let {
            setLocale,
            locale,
            location,
            match: { params },
        } = this.props
        // if locale from state does not match locale from url
        // use locale from state
        if (locale !== params.locale) {
            setLocale(locale, location, true)
        }
    }

    render() {
        let {
            allMeasures,
            popular,
            status,
            locale,
            openAbout,
            presidentialManifesto,
        } = this.props
        const measuresWithCount = compact(
            popular.map(({ itemId }) => allMeasures.measures[itemId])
        ).map(measure => ({
            ...measure,
            count:
                get(popular.find(p => p.itemId === measure.id), 'count') || 0,
        }))

        return (
            <div className="dashboard">
                <ReactTooltip
                    place="top"
                    type="light"
                    effect="solid"
                    className="measure-manifesto__tooltip"
                />

                <DashboardHeader locale={locale} openAbout={openAbout} />

                <DashboardBody>
                    <DashboardTimer
                        total={this.state.totalDaysInTerm}
                        current={this.state.daysRemainingInTerm}
                        locale={locale}
                    />
                    <DashboardRow>
                        <DashboardBox className="dashboard-progression">
                            <h3 className="dashboard-box__title">
                                {T.translate('dashboard.titleChart', {
                                    context: locale,
                                })}
                            </h3>
                            <LastUpdated
                                className="dashboard-updated"
                                locale={locale}
                            />

                            <PieChart
                                measures={status.measures}
                                locale={locale}
                                presidentialManifesto={presidentialManifesto}
                            />
                        </DashboardBox>
                        <DashboardBox className="dashboard-popular">
                            <h3 className="dashboard-box__title">
                                {T.translate('dashboard.titlePopular', {
                                    context: locale,
                                })}
                            </h3>
                            {!!allMeasures.items.length && (
                                <Measures
                                    className="popular-measures"
                                    measures={measuresWithCount}
                                    viewAll
                                />
                            )}
                            <div className="dashboard-box__cta u-align-center">
                                <Link to={`/${locale}/results`}>
                                    {T.translate('dashboard.linkPopular', {
                                        context: locale,
                                    })}{' '}
                                    →
                                </Link>
                            </div>
                        </DashboardBox>
                    </DashboardRow>

                    <DashboardRow>
                        <DashboardBox>
                            <div className="dashboard-box__header">
                                <div className="dashboard-svg">
                                    <ReactSVG
                                        path={`${rootPath}/assets/svg/manifesto-presidentielle.svg`}
                                        className="dashboard-svg__presidentielle"
                                    />
                                </div>

                                <h3 className="dashboard-box__title dashboard-box__title--small">
                                    Notre projet national (2017)
                                </h3>
                            </div>

                            <div className="dashboard-box__body">
                                <p>
                                    Notre programme national a été construit en
                                    2016-2017 avec plus de 30 000 Françaises et
                                    Français de tous milieux sociaux, de tous
                                    âges, dans tous les territoires de France,
                                    au cours de 3 000 ateliers de nos comités
                                    locaux.
                                </p>
                                <div className="dashboard-box__cta">
                                    <a
                                        href="https://en-marche.fr/emmanuel-macron/le-programme"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Programme d’Emmanuel Macron →
                                    </a>
                                </div>
                            </div>
                        </DashboardBox>

                        <DashboardBox>
                            <div className="dashboard-box__header">
                                <div className="dashboard-svg">
                                    <ReactSVG
                                        path={`${rootPath}/assets/svg/manifesto-europeennes.svg`}
                                        className="dashboard-svg__europeennes"
                                    />
                                </div>

                                <h3 className="dashboard-box__title dashboard-box__title--small">
                                    Notre projet européen (2019)
                                </h3>
                            </div>

                            <div className="dashboard-box__body">
                                <p>
                                    Ce projet a été construit en 2018-2019 avec
                                    80 000 Français interrogés par porte-à-porte
                                    durant la Grande Marche pour l'Europe et 20
                                    000 adhérents consultés. Leurs milliers de
                                    constats et de propositions ont été
                                    complétés par ceux d’une centaine d’experts
                                    de l’Europe.
                                </p>
                                <div className="dashboard-box__cta">
                                    <a
                                        href="https://en-marche.fr/articles/actualites/programme-renaissance"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Programme Renaissance →
                                    </a>
                                </div>
                            </div>
                        </DashboardBox>
                    </DashboardRow>

                    <DashboardRow>
                        <DashboardBox full className="dashboard-box--gradient">
                            <div className="dashboard-box__body">
                                <h3 className="dashboard-box__title">
                                    Les 2 ans du quinquennat
                                </h3>

                                <p>
                                    Consultez les différentes actions qui ont
                                    été réalisées depuis 2 ans dans votre
                                    commune et ses environs.
                                </p>

                                <div className="dashboard-box__cta">
                                    <a
                                        href="https://chezvous.en-marche.fr"
                                        rel="noopener noreferrer"
                                        target="_blank"
                                    >
                                        Ce qui a changé près de chez vous →
                                    </a>
                                </div>
                            </div>

                            <div className="dashboard-box--background">
                                <ReactSVG
                                    path={`${rootPath}/assets/svg/city.svg`}
                                    className="dashboard-svg__city"
                                />
                                <ReactSVG
                                    path={`${rootPath}/assets/svg/cloud-big.svg`}
                                    className="dashboard-svg__cloud-big"
                                />
                                <ReactSVG
                                    path={`${rootPath}/assets/svg/cloud-small.svg`}
                                    className="dashboard-svg__cloud-small"
                                />
                            </div>
                        </DashboardBox>
                    </DashboardRow>

                    <DashboardRow>
                        <DashboardBox className="dashboard-box--subscribe">
                            <h3 className="dashboard-box__title">
                                Pour être les premiers informés, inscrivez-vous
                                à la newsletter hebdomadaire du mouvement
                            </h3>

                            <Subscribe locale={locale} {...FORM_PROPS} />
                        </DashboardBox>

                        <DashboardBox className="dashboard-box--donation">
                            <span className="highlight-circle"></span>
                            <h3 className="dashboard-box__title">
                              Un don pour transformer la France !
                            </h3>
                            <p>
                              Chaque don, quel que soit le montant, nous permet d’engager une action concrète pour
                              réussir ensemble la transformation du pays.
                            </p>
                            <a href="https://en-marche.fr/don" className="btn btn--red" target="_blank" rel="noopener noreferrer">Je donne maintenant</a>
                        </DashboardBox>
                    </DashboardRow>
                </DashboardBody>
            </div>
        )
    }
}

export default connect(
    state => ({
        popular: state.popular.items,
        status: state.status,
        allMeasures: state.measures,
        presidentialManifesto: state.manifestos.presidentialManifesto,
        locale: state.locale,
        openAbout: state.openAbout,
    }),
    dispatch => ({
        openAbout: () => dispatch(openAbout()),
        setLocale: (...args) => dispatch(setLocale(...args)),
    })
)(withRouter(Dashboard))
