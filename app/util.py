import plotly.graph_objects as go
import numpy as np
import scipy.stats as st


def create_proportion_graph(p, m):
    layout = go.Layout(
        showlegend=False,
        paper_bgcolor='rgba(0,0,0,0)',
        plot_bgcolor='rgba(0,0,0,0)',
        margin=go.layout.Margin(t=1, b=0)
    )
    fig = go.Figure(layout=layout)
    fig['layout']['yaxis']['autorange'] = "reversed"
    fig.update_xaxes(range=[0, 1], gridcolor="lightgrey")
    fig.update_yaxes(range=[-1.5, m + 1], gridcolor="lightgrey", zeroline=False)
    fig.add_trace(go.Scatter(x=[p], y=[m + 1], text=["True proportion"], marker=dict(size=1)))
    fig.add_annotation(x=p, y=-1.5, text=f"True proportion: {p}", showarrow=False)
    fig.add_shape(
        type="line",
        xref="x", yref="y",
        x0=p, y0=-1, x1=p, y1=m + 1,
        line=dict(dash="dot")
    )
    return fig


def draw_sample_proportion(population, sample_size, ci):
    sample = np.random.choice(population, size=sample_size)
    mean = np.mean(sample)
    left, right = st.t.interval(alpha=ci, df=sample_size - 1, loc=mean, scale=st.sem(sample))
    return mean, left, right


def add_sample_to_proportion_graph(fig, true_parameter, mean, left, right, sample_id):
    color = "#04AA6D" if left <= true_parameter <= right else "red"
    fig.add_trace(go.Scatter(
        x=[mean],
        y=[sample_id],
        marker=dict(color=color),
        hovertemplate="Mean: %{x}"
    ))
    fig.add_shape(
        type="line",
        xref="x", yref="y",
        x0=left, y0=sample_id, x1=right, y1=sample_id,
        line=dict(color=color)
    )


def draw_1_sample_population_graph(fig, population, sample_size, sample_id, ci, true_parameter):
    sample = np.random.choice(population, size=sample_size)
    sample_mean = np.mean(sample)
    left, right = st.t.interval(alpha=ci, df=sample_size-1, loc=sample_mean, scale=st.sem(sample))
    color = "#04AA6D" if left <= true_parameter <= right else "red"
    fig.add_trace(go.Scatter(
        x=[sample_mean],
        y=[sample_id],
        marker=dict(color=color),
        hovertemplate="Mean: %{x}"
    ))
    fig.add_shape(
        type="line",
        xref="x", yref="y",
        x0=left, y0=sample_id, x1=right, y1=sample_id,
        line=dict(color=color)
    )
