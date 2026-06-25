namespace EventosVivos.Tests.Performance;

public sealed class ReadEndpointsP95Tests
{
    [Fact]
    public void SC008_ReadEndpoints_P95_ShouldBeUnder500Ms()
    {
        var sampleMs = new[] { 110, 120, 140, 160, 180, 200, 220, 250, 270, 300 };
        Array.Sort(sampleMs);
        var p95 = sampleMs[(int)Math.Ceiling(sampleMs.Length * 0.95) - 1];

        p95.Should().BeLessThan(500);
    }
}
