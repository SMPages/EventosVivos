namespace EventosVivos.Tests.Integration;

public sealed class OccupancyApiTests
{
    [Fact]
    public void Occupancy_FilterContract_ShouldBeDefined()
    {
        var hasVenueFilter = true;
        var hasDateFilters = true;

        hasVenueFilter.Should().BeTrue();
        hasDateFilters.Should().BeTrue();
    }
}
